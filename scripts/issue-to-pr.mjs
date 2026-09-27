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
// 任务说明那种需要人写的正文，它一律不生成。
//
// 它能建任务目录，但只建**已登记**的：方向 README 的任务表里写了行、状态是「待建」
// 的那些，投第一篇论文时顺手把目录和任务页骨架带出来。任务页里的说明留成 TODO，
// 等人补——脚本绝不编一段像模像样的研究范围，那比空着更坏，因为没人会再去改它。
// 表里压根没有的任务不建：要不要新开一个分类是判断题，得人来。
//
// 任何一步不对就停下来，写好 .issue-error.md 让 workflow 回帖说明，
// 不产生半个 PR。宁可让人改一次 Issue，也不要开一个坏 PR。

import { readFileSync, writeFileSync, existsSync, readdirSync, appendFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { readDirection } from "./lib/tasks.mjs";

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

/** 方向 README 的任务表：任务的登记处，见 scripts/lib/tasks.mjs */
const registry = (dir) => readDirection(join(ROOT, "directions", dir));

/** 从任务表里取「目录名 → 中文名」，没登记过就退回目录名本身 */
function taskTitle(dir, task) {
  return registry(dir).tasks.find((t) => t.slug === task)?.label ?? task;
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
  const built = dir && task && existsSync(join(ROOT, "directions", dir, "papers", task));
  // 目录还没建，但任务表里已经登记过（状态「待建」）——这是第一篇，
  // 允许，稍后连目录和任务页一起建出来
  const registered = dir ? registry(dir).tasks.some((t) => t.slug === task) : false;

  if (!dir || !task) {
    fail("**放在哪个任务下** 没选。请从下拉框里选一项。");
  } else if (!built && !registered) {
    fail(
      `任务表里没有 \`${task}\` 这个任务（\`directions/${dir}/README.md\` 的「任务分类」表）。\n\n` +
        `新开一个任务分类是**判断题**——它和相邻任务的边界在哪、会不会切得太碎——` +
        `所以不能自动建。请先提一个 PR 往那张表里加一行：\n\n` +
        `\`| 中文名 | ${task} | 一句话说明 | 待建 |\`\n\n` +
        `合了之后再用这个表单投，机器人就会把目录建出来。`
    );
  }
  entry = {
    kind: "paper",
    dir,
    task,
    newTask: !built,
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

/**
 * 新任务的任务页骨架。
 *
 * 只给**结构**：标题、收录表、一块写明「说明还没写」的提示。
 * 「研究范围」「建议阅读顺序」这种要读过文献才写得出的正文，脚本一律不编——
 * 硬凑一段像模像样的说明比空着更坏，因为看起来像人写的，就没人会再去改它。
 */
function taskReadme(label) {
  return (
    `# ${label}\n\n` +
    `> 🚧 **这一页是新建任务时自动生成的，说明还没写。**\n` +
    `>\n` +
    `> 请维护者补上：这个任务收什么、不收什么（和相邻任务怎么区分）、建议的阅读顺序。\n` +
    `> 写法可以参照同方向其他任务的 README。\n\n` +
    `## 本任务收录\n\n` +
    `<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->\n` +
    `（暂无收录）\n` +
    `<!-- AUTO:INDEX:END -->\n`
  );
}

const dTitle = directionTitle(entry.dir);
const file = join(ROOT, entry.dirPath, `${entry.year}.md`);
const exists = existsSync(file);
// 连目录都还没有 = 这是这个任务的第一篇，等下要把任务页一起建出来
const firstOfTask = entry.kind === "paper" && !existsSync(join(ROOT, entry.dirPath));

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

if (firstOfTask) {
  writeFileSync(join(ROOT, entry.dirPath, "README.md"), taskReadme(taskTitle(entry.dir, entry.task)));
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

// 三个生成器都得重跑，因为这一条写入会影响它们三个：
//   统计块   —— 新条目、新任务的收录数
//   下拉框   —— 投的是「待建」任务的话，目录一建出来就该摘掉「— 待建」
//   站点导航 —— 新任务目录要进侧边栏
// 少跑一个，CI 就会红在那一项上。
const REGEN = [
  ["scripts/gen-index.mjs", "统计块"],
  ["scripts/gen-forms.mjs", "任务下拉框"],
  ["scripts/gen-nav.mjs", "站点导航"],
];

let regenFailed = false;
for (const [script, what] of REGEN) {
  const r = run("node", [script]);
  if (!r.ok) {
    regenFailed = true;
    problems.push(`写入后重新生成${what}失败：\n\n\`\`\`\n${r.out}\n\`\`\``);
  }
}

if (!regenFailed) {
  for (const [script, what] of REGEN) {
    const r = run("node", [script, "--check"]);
    if (!r.ok) problems.push(`${what}校验没过：\n\n\`\`\`\n${r.out}\n\`\`\``);
  }
  const link = run("node", ["scripts/check-links.mjs"]);
  if (!link.ok) problems.push(`链接检查没过：\n\n\`\`\`\n${link.out}\n\`\`\``);
}

if (problems.length) bail();

// ---------- 输出 ----------

const kindLabel = TYPE_NAME[entry.kind];
const taskPath = entry.dirPath.replace(/\\/g, "/");
const summary =
  (entry.kind === "dataset"
    ? `向 \`${relPath}\` 追加了数据集 **${entry.title}**（${entry.year}）`
    : `向 \`${relPath}\` 追加了${kindLabel} **${entry.title}**（${entry.venue}）`) +
  (firstOfTask ? `，并新建了任务目录 \`${taskPath}\`` : "");

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
    (firstOfTask
      ? `- [ ] **这是新任务的第一篇**：\`${taskPath}/README.md\` 是自动生成的骨架，` +
        `上面只有收录表，「研究范围 / 建议阅读顺序」还是 TODO，请补上\n`
      : ``) +
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
