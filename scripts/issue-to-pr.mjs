#!/usr/bin/env node
// 把 Issue 表单的内容变成仓库里的一行条目。
//
// 由 .github/workflows/issue-to-pr.yml 调用，输入走环境变量：
//
//   ISSUE_BODY     Issue 正文（GitHub 表单会渲染成 "### 字段名\n\n值" 的形式）
//   ISSUE_NUMBER   Issue 编号，用来写进 PR 描述
//   ISSUE_LABELS   逗号分隔的标签，用来判断是哪个表单
//   GITHUB_OUTPUT  Actions 的输出文件，本脚本往里面写 ok / title / summary
//
// 设计原则：**只做追加，不碰手写内容。** 这个脚本只会在表格末尾加一行，
// 以及在年份文件不存在时新建一个只有表头和表头行的文件。
// 任务说明那种需要人写的正文，它一律不生成——所以新任务目录不在支持范围内。
//
// 任何一步不对就停下来，写好 .issue-error.md 让 workflow 回帖说明，
// 不产生半个 PR。宁可让人改一次 Issue，也不要开一个坏 PR。

import { readFileSync, writeFileSync, existsSync, readdirSync, appendFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BODY = process.env.ISSUE_BODY ?? "";
const NUMBER = process.env.ISSUE_NUMBER ?? "";
const LABELS = (process.env.ISSUE_LABELS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

// ---------- 表单解析 ----------

/** 去掉字段名末尾的括号说明，方便按前缀匹配 */
const norm = (s) => s.replace(/（[^）]*）|\([^)]*\)/g, "").trim();

/**
 * GitHub 表单渲染出来的正文长这样：
 *
 *   ### 论文完整标题
 *
 *   Mask R-CNN
 *
 *   ### 代码仓库（没有就留空）
 *
 *   _No response_
 *
 * 按 "### " 切块取值。未填的可选字段是 "_No response_"。
 */
function parseForm(body) {
  const fields = {};
  const re = /###\s+(.+?)\n+([\s\S]*?)(?=\n###\s+|$)/g;
  let m;
  while ((m = re.exec(body))) {
    const val = m[2].trim();
    fields[norm(m[1])] = val === "_No response_" ? "" : val;
  }
  return fields;
}

/** 按字段名前缀取值，找不到返回空串 */
function pick(fields, ...prefixes) {
  for (const p of prefixes) {
    for (const [k, v] of Object.entries(fields)) {
      if (k === p || k.startsWith(p)) return v;
    }
  }
  return "";
}

// ---------- 类型判定 ----------

function detectType(fields) {
  if (LABELS.includes("add-paper")) return "paper";
  if (LABELS.includes("add-survey")) return "survey";
  if (LABELS.includes("add-dataset")) return "dataset";
  // 标签可能因为仓库里还没有而被 GitHub 丢掉，退回按字段形状判断
  if (fields["规模"] !== undefined) return "dataset";
  if (fields["放在哪个任务下"] !== undefined) return "paper";
  return "survey";
}

// ---------- 仓库元信息（从现有 markdown 里读，不写死） ----------

/** directions/<dir>/README.md 的一级标题 */
function directionTitle(dir) {
  const p = join(ROOT, "directions", dir, "README.md");
  if (!existsSync(p)) return dir;
  const m = readFileSync(p, "utf8").match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : dir;
}

/** 从方向 README 的任务表里取「目录名 → 中文名」 */
function taskTitle(dir, task) {
  const p = join(ROOT, "directions", dir, "README.md");
  if (!existsSync(p)) return task;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|/);
    if (m && m[2].trim() === task) return m[1].trim();
  }
  return task;
}

// ---------- 校验 ----------

const problems = [];
const fail = (msg) => problems.push(msg);

/**
 * 下拉框的值长这样：「01-ai-for-animals（AI+动物）」。
 * 只要开头的目录名——用 \S+ 会把中文括号一起吞掉（中文不算空白），
 * 拼出来的路径就成了「01-ai-for-animals（AI+动物）/surveys」。
 */
const parseDirection = (raw) => (raw.match(/^[0-9a-z-]+/i) ?? [""])[0];

/**
 * 归一化链接，用来判重，顺便把 arXiv 的 PDF 直链掰回摘要页。
 *
 * 判重不能只比字符串：同一条论文，一个人贴 /abs/2408.12934、另一个人贴
 * /pdf/2408.12934，字符串不同但说的是同一篇，会被当成两条收进来。
 * 所以统一归一到「arxiv:<id>」这种键上。
 */
function linkKey(url) {
  const ax = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(v\d+)?/i);
  if (ax) return `arxiv:${ax[1]}`;
  return url
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/[#?].*$/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function checkUrl(url, fieldName) {
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    fail(`**${fieldName}** 得是一个完整网址（要带 https://），现在是「${url}」。`);
    return "";
  }
  // arXiv 的 PDF 直链直接掰成摘要页——这是贡献指南要求的写法，
  // 而且不改的话判重也会漏掉（见 linkKey）。
  const axPdf = url.match(/^(https?:\/\/arxiv\.org)\/pdf\/(.+?)(\.pdf)?$/i);
  if (axPdf) return `${axPdf[1]}/abs/${axPdf[2]}`;

  if (/\.pdf$/i.test(url)) {
    fail(
      `**${fieldName}** 指向了 PDF 直链。请换成摘要页或 DOI 页面——\n` +
        `PDF 链接更容易失效，贡献指南里也明确要求不要贴。`
    );
    return "";
  }
  return url;
}

// 表格里出现裸的 | 会把这一行切成两列，宁可让人去掉也不要静默写坏表格
function checkTableCell(text, fieldName, maxLen) {
  const v = text.replace(/\s*\n+\s*/g, " ").trim();
  if (!v) {
    fail(`**${fieldName}** 不能为空。`);
    return "";
  }
  if (v.includes("|")) {
    fail(`**${fieldName}** 里不能出现竖线 \`|\`——它会破坏表格结构，请换成别的符号。`);
    return "";
  }
  if (maxLen && v.length > maxLen) {
    fail(`**${fieldName}** 太长了（${v.length} 字）。请压缩到 ${maxLen} 字以内，详细内容留给论文本身。`);
    return "";
  }
  return v;
}

// ---------- 主流程 ----------

const fields = parseForm(BODY);
const type = detectType(fields);

const TYPE_NAME = { paper: "论文", survey: "综述", dataset: "数据集" };

let entry = null;

if (type === "paper") {
  const raw = pick(fields, "放在哪个任务下");
  const m = raw.match(/^(\S+)\s*\/\s*([^\s（(]+)/);
  const dir = m ? m[1] : "";
  const task = m ? m[2] : "";
  if (!dir || !task) {
    fail("**放在哪个任务下** 没选。请从下拉框里选一项。");
  } else if (!existsSync(join(ROOT, "directions", dir, "papers", task))) {
    fail(
      `找不到任务目录 \`directions/${dir}/papers/${task}\`。新任务目录需要先由维护者创建` +
        `（要配一份手写的任务说明），请改成已有的任务，或先开 Issue 讨论。`
    );
  }
  entry = {
    kind: "paper",
    dir,
    task,
    dirPath: join("directions", dir, "papers", task),
    year: pick(fields, "发表年份"),
    title: checkTableCell(pick(fields, "论文完整标题"), "论文完整标题", 200),
    link: checkUrl(pick(fields, "链接"), "链接"),
    venue: checkTableCell(pick(fields, "发表在哪"), "发表在哪", 40),
    code: checkUrl(pick(fields, "代码仓库"), "代码仓库"),
    desc: checkTableCell(pick(fields, "一句话贡献"), "一句话贡献", 120),
  };
} else if (type === "survey") {
  const dir = parseDirection(pick(fields, "放在哪个方向下"));
  if (!dir || !existsSync(join(ROOT, "directions", dir))) {
    fail("**放在哪个方向下** 没选对，请从下拉框里选一项。");
  }
  entry = {
    kind: "survey",
    dir,
    dirPath: join("directions", dir, "surveys"),
    year: pick(fields, "发表年份"),
    title: checkTableCell(pick(fields, "综述完整标题"), "综述完整标题", 200),
    link: checkUrl(pick(fields, "链接"), "链接"),
    venue: checkTableCell(pick(fields, "发表在哪"), "发表在哪", 40),
    code: checkUrl(pick(fields, "代码仓库"), "代码仓库"),
    desc: checkTableCell(pick(fields, "覆盖范围与主要结论"), "覆盖范围与主要结论", 120),
  };
} else {
  const dir = parseDirection(pick(fields, "放在哪个方向下"));
  if (!dir || !existsSync(join(ROOT, "directions", dir))) {
    fail("**放在哪个方向下** 没选对，请从下拉框里选一项。");
  }
  const access = pick(fields, "获取方式");
  const accessLink = checkUrl(pick(fields, "从哪拿"), "从哪拿");
  entry = {
    kind: "dataset",
    dir,
    dirPath: join("directions", dir, "datasets"),
    year: pick(fields, "发布年份"),
    title: checkTableCell(pick(fields, "数据集名称"), "数据集名称", 120),
    link: checkUrl(pick(fields, "链接"), "链接"),
    scale: checkTableCell(pick(fields, "规模"), "规模", 300),
    access: accessLink ? `[获取入口](${accessLink})，${access}` : checkTableCell(access, "获取方式", 40),
    license: checkTableCell(pick(fields, "License"), "License", 60),
  };
}

// 年份：四位数字，且落在合理区间
if (entry && !/^\d{4}$/.test(entry.year)) {
  fail(`**年份** 得是四位数字，现在是「${entry.year}」。`);
} else if (entry) {
  const y = Number(entry.year);
  if (y < 1990 || y > 2100) fail(`**年份** ${y} 看着不对，请确认填的是正式发表的年份。`);
}

// 重复收录：同一条链接已经在仓库里就不再加。
// 按归一化后的键比较而不是原文，否则 /abs/ 和 /pdf/ 会被当成两条。
if (entry && entry.link) {
  const key = linkKey(entry.link);
  const seen = [];
  const walk = (abs) => {
    for (const e of readdirSync(abs, { withFileTypes: true })) {
      const p = join(abs, e.name);
      if (e.isDirectory()) {
        walk(p);
        continue;
      }
      if (!e.name.endsWith(".md")) continue;
      const urls = readFileSync(p, "utf8").match(/https?:\/\/[^\s)|>]+/g) ?? [];
      if (urls.some((u) => linkKey(u) === key)) {
        seen.push(p.replace(ROOT, "").replace(/^[\\/]/, "").replace(/\\/g, "/"));
      }
    }
  };
  walk(join(ROOT, "directions"));
  if (seen.length) {
    fail(
      `这条**已经收录过了**，在：\n\n` +
        seen.map((s) => `- \`${s}\``).join("\n") +
        `\n\n如果是想补充信息，请直接在 GitHub 上编辑那个文件（或告诉维护者），不用另开 Issue。`
    );
  }
}

// ---------- 有错就停 ----------

function bail() {
  const body =
    `自动处理没成功，有 ${problems.length} 处需要改一下：\n\n` +
    problems.map((p, i) => `${i + 1}. ${p}`).join("\n\n") +
    `\n\n---\n**改完直接编辑上面的 Issue 内容即可**，机器人会重新处理。` +
    `\n（这条是自动回复，不用管它。）\n`;
  writeFileSync(join(ROOT, ".issue-error.md"), body);
  writeOut("ok", "false");
  console.log("校验未通过：\n" + problems.join("\n"));
  process.exit(0);
}

function writeOut(key, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

if (!entry || problems.length) {
  if (!entry && !problems.length) fail("没能识别这个表单，请用仓库提供的 Issue 表单提交。");
  bail();
}

// ---------- 生成行 ----------

// 论文和综述的列结构一样（标题/发表/代码/描述），只有数据集不同
const codeCell = entry.code ? `[代码](${entry.code})` : "—";
const row =
  entry.kind === "dataset"
    ? `| [${entry.title}](${entry.link}) | ${entry.scale} | ${entry.access} | ${entry.license} |`
    : `| [${entry.title}](${entry.link}) | ${entry.venue} | ${codeCell} | ${entry.desc} |`;

const dTitle = directionTitle(entry.dir);
const file = join(ROOT, entry.dirPath, `${entry.year}.md`);
const exists = existsSync(file);

if (exists) {
  const cur = readFileSync(file, "utf8");
  if (!cur.endsWith("\n")) writeFileSync(file, cur + "\n");
  appendFileSync(file, row + "\n");
} else {
  mkdirSync(dirname(file), { recursive: true });
  const header =
    entry.kind === "paper"
      ? `# ${taskTitle(entry.dir, entry.task)} · ${entry.year} 年论文\n\n` +
        `> ${entry.year} 年正式发表。返回：[${dTitle}](../../README.md) ｜ [${taskTitle(entry.dir, entry.task)}](README.md)\n\n` +
        `| 标题 | 发表 | 代码 | 一句话贡献 |\n| --- | --- | --- | --- |\n`
      : entry.kind === "survey"
        ? `# ${dTitle} · ${entry.year} 年综述\n\n` +
          `> ${entry.year} 年正式发表。返回：[${dTitle}](../README.md)\n\n` +
          `| 标题 | 发表 | 代码 | 覆盖范围与主要结论 |\n| --- | --- | --- | --- |\n`
        : `# ${dTitle} · ${entry.year} 年数据集\n\n` +
          `> ${entry.year} 年公开发布。返回：[${dTitle}](../README.md)\n\n` +
          `| 数据集 | 规模 | 获取方式 | License |\n| --- | --- | --- | --- |\n`;
  writeFileSync(file, header + row + "\n");
}

const relPath = file.replace(ROOT, "").replace(/^[\\/]/, "").replace(/\\/g, "/");

// ---------- 自检 ----------
// 让 CI 会跑的检查先在这里跑一遍。统计块过期或链接指错，就别开 PR 了。

function run(cmd, args) {
  try {
    return { ok: true, out: execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: "pipe" }) };
  } catch (e) {
    return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}`.trim() };
  }
}

const gen = run("node", ["scripts/gen-index.mjs"]);
if (!gen.ok) {
  problems.push(`写入后重新生成统计块失败：\n\n\`\`\`\n${gen.out}\n\`\`\``);
} else {
  const stale = run("node", ["scripts/gen-index.mjs", "--check"]);
  const link = run("node", ["scripts/check-links.mjs"]);
  if (!stale.ok) problems.push(`统计块校验没过：\n\n\`\`\`\n${stale.out}\n\`\`\``);
  if (!link.ok) problems.push(`链接检查没过：\n\n\`\`\`\n${link.out}\n\`\`\``);
}

if (problems.length) bail();

// ---------- 输出 ----------

const kindLabel = TYPE_NAME[entry.kind];
const summary =
  entry.kind === "dataset"
    ? `向 \`${relPath}\` 追加了数据集 **${entry.title}**（${entry.year}）`
    : `向 \`${relPath}\` 追加了${kindLabel} **${entry.title}**（${entry.venue}）`;

writeFileSync(
  join(ROOT, ".issue-pr-body.md"),
  `由 Issue #${NUMBER} 自动生成。\n\n${summary}\n\n` +
    `| 字段 | 值 |\n| --- | --- |\n` +
    Object.entries({
      标题: entry.title,
      链接: entry.link,
      年份: entry.year,
      写入位置: `\`${relPath}\``,
      ...(entry.kind === "dataset"
        ? { 规模: entry.scale, 获取方式: entry.access, License: entry.license }
        : { 发表: entry.venue, 代码: entry.code || "（无）", [entry.kind === "paper" ? "一句话贡献" : "覆盖范围"]: entry.desc }),
    })
      .map(([k, v]) => `| ${k} | ${v} |`)
      .join("\n") +
    `\n\n---\n\n**审核要点**\n\n` +
    `- [ ] 链接能打开，且不是 PDF 直链\n` +
    `- [ ] 年份用的是**正式发表年**（不是 arXiv 上传年）\n` +
    `- [ ] 归类正确：按**主实验用的数据集**判断（动物数据集 → 01，通用基准 → 02）\n` +
    `- [ ] 「${entry.kind === "paper" ? "一句话贡献" : entry.kind === "survey" ? "覆盖范围" : "规模"}」是自己读过的总结，不是复制的摘要\n` +
    (entry.kind === "dataset" ? `- [ ] License 是从官方页面抄的，不是推断的\n` : ``) +
    `\nCloses #${NUMBER}\n`
);

writeOut("ok", "true");
writeOut("title", `添加：${entry.year} ${entry.title}`);
writeOut("summary", summary.replace(/\n/g, " "));
console.log(summary);
