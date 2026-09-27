#!/usr/bin/env node
// 文献统计生成器：扫描 directions/ 下的实际文件，重写 README 里被标记的统计块。
//
//   node scripts/gen-index.mjs          重写所有统计块
//   node scripts/gen-index.mjs --check  只检查，统计块过期则退出码 1（CI 用）
//
// 统计块的写法（BEGIN/END 之间整段由本脚本接管，不要手改）：
//   <!-- AUTO:OVERVIEW:BEGIN -->
//   ...由脚本生成...
//   <!-- AUTO:OVERVIEW:END -->
//
// 可用的块名：
//   OVERVIEW     根 README 的方向总览（论文/综述/数据集 计数）
//   COLLECTION   方向 README 的已收录内容（按任务列出各年份）
//   INDEX        目录级合并总表：把该目录下所有年份文件的表格拼成一张，
//                前面加一列年份。表头沿用年份文件自己的，所以论文、综述、
//                数据集三种不同列数的表都能用同一个函数
//
// 块是逐个文件自愿加的：文件里没有对应标记就跳过，不报错（空的目录不值得
// 先摆一个「暂无收录」）。
//
// 只统计「数据」表格，README 的叙述文字与阅读顺序不受影响。

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHECK = process.argv.includes("--check");

// ---------- 扫描 ----------

/** 目录下所有 .md 文件（不含 README.md），按文件名排序 */
function yearFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();
}

/**
 * 解析一个年份文件，得到两样东西：
 *   items —— 条目（标题），计数和 COLLECTION 用
 *   table —— 表格本身（表头 + 整行），合并总表用
 * 条目行以「| [」开头，据此把表头和分隔行排除掉。
 */
function parseYear(file) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  const items = lines
    .filter((l) => /^\|\s*\[/.test(l))
    .map((l) => ({ title: l.match(/^\|\s*\[([^\]]+)\]/)?.[1] ?? "?" }));

  const sep = lines.findIndex((l) => /^\|\s*:?-{3,}/.test(l));
  let table = null;
  if (sep > 0) {
    const cells = lines[sep - 1]
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    const rows = [];
    for (let i = sep + 1; i < lines.length; i++) {
      if (/^\|\s*\[/.test(lines[i])) rows.push(lines[i].trimEnd());
      else if (rows.length) break; // 表格到此为止
    }
    if (cells.length && rows.length) table = { cells, rows };
  }
  return { items, table };
}

/** 各任务子目录（papers/ 下，排除空目录） */
function taskDirs(dir) {
  const base = join(dir, "papers");
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function scanDirection(dir) {
  const scan = (sub) =>
    yearFiles(join(dir, sub)).map((f) => ({
      year: f.replace(/\.md$/, ""),
      file: f,
      ...parseYear(join(dir, sub, f)),
    }));

  const papers = {};
  // 用模板串而不是 join：join 在 Windows 上产出反斜杠，CI（Linux）会把
  // 「papers\behavior」当成一个文件名，找不到目录
  for (const task of taskDirs(dir)) papers[task] = scan(`papers/${task}`);
  return { papers, surveys: scan("surveys"), datasets: scan("datasets") };
}

const count = (o) => Object.values(o).flat().reduce((n, f) => n + f.items.length, 0);

// ---------- 生成 ----------

function blockOverview(dirs) {
  const rows = Object.entries(dirs).map(([name, d]) => {
    const p = count(d.papers);
    const s = d.surveys.reduce((n, f) => n + f.items.length, 0);
    const ds = d.datasets.reduce((n, f) => n + f.items.length, 0);
    const link = `[${d.display}](${d.rel}/)`;
    return `| ${link} | ${p ? `${p} 篇` : "—"} | ${s ? `${s} 篇` : "—"} | ${ds ? `${ds} 个` : "—"} |`;
  });
  return ["| 方向 | 论文 | 综述 | 数据集 |", "| --- | --- | --- | --- |", ...rows].join("\n");
}

/** prefix：链接前缀。方向 README 内部用 ""，根 README 用 "directions/<name>/" */
function blockCollection(d, prefix) {
  const out = [];

  const rank = (t) => {
    const i = d.taskOrder.indexOf(t);
    return i === -1 ? d.taskOrder.length : i;
  };
  const paperTasks = Object.entries(d.papers)
    .filter(([, files]) => files.length)
    .sort(([a], [b]) => rank(a) - rank(b));
  if (paperTasks.length) {
    const total = count(d.papers);
    out.push(`**论文**（${total} 篇）`, "", "| 任务 | 年份 |", "| --- | --- |");
    for (const [task, files] of paperTasks) {
      const cells = files
        .map((f) => `[${f.year}](${prefix}papers/${task}/${f.file})`)
        .join(" · ");
      out.push(`| [${d.taskLabels[task] ?? task}](papers/${task}/) | ${cells} |`);
    }
    out.push("");
  }

  if (d.surveys.length) {
    const total = d.surveys.reduce((n, f) => n + f.items.length, 0);
    out.push(`**综述**（${total} 篇）`, "", "| 年份 | 条目 |", "| --- | --- |");
    for (const f of d.surveys) {
      out.push(
        `| ${f.year} | [${f.items.length} 篇](${prefix}surveys/${f.file}) — ${f.items.map((i) => i.title).join("、")} |`
      );
    }
    out.push("");
  }

  if (d.datasets.length) {
    const total = d.datasets.reduce((n, f) => n + f.items.length, 0);
    out.push(`**数据集**（${total} 个）`, "", "| 年份 | 条目 |", "| --- | --- |");
    for (const f of d.datasets) {
      out.push(
        `| ${f.year} | [${f.items.length} 个](${prefix}datasets/${f.file}) — ${f.items.map((i) => i.title).join("、")} |`
      );
    }
    out.push("");
  }

  return out.join("\n").trimEnd();
}

/**
 * 合并总表：把一个目录下所有年份文件的表格拼成一张，前面加一列年份，
 * 年份那一格链回年份文件。
 *
 * 这样任何一级 README 点开就是该目录的完整清单——比如 datasets/README.md
 * 直接列出全部数据集，不用逐个年份文件翻。表格是生成的，所以永远不会
 * 出现「目录里有 12 个数据集、README 里只有 1 个」这种烂法。
 *
 * 表头沿用年份文件自己的，所以论文（标题/发表/代码/一句话贡献）和
 * 数据集（数据集/规模/获取方式/License）用同一个函数，不需要按类型写死。
 */
function blockIndex(files, unit) {
  const ordered = [...files].reverse(); // 新的在前
  const total = ordered.reduce((n, f) => n + f.items.length, 0);
  if (!total) return "（暂无收录）";

  const head = ordered.find((f) => f.table)?.table.cells ?? ["标题"];
  const out = [
    `共 ${total} ${unit}。`,
    "",
    `| 年份 | ${head.join(" | ")} |`,
    `| --- | ${head.map(() => "---").join(" | ")} |`,
  ];
  for (const f of ordered) {
    // 条目行本身以「| 」开头，所以直接接在年份格后面
    for (const row of f.table?.rows ?? []) out.push(`| [${f.year}](${f.file}) ${row}`);
  }
  return out.join("\n");
}

// ---------- 写回 ----------

const FILES = new Map(); // abs path -> { text, dirty }

function read(abs) {
  if (!FILES.has(abs)) FILES.set(abs, { text: readFileSync(abs, "utf8"), dirty: false });
  return FILES.get(abs);
}

/** 文件里没写这个标记就跳过：块是逐个文件自愿加的，不强制 */
function injectIfPresent(abs, name, body) {
  if (!existsSync(abs)) return;
  if (!readFileSync(abs, "utf8").includes(`<!-- AUTO:${name}:BEGIN`)) return;
  inject(abs, name, body);
}

function inject(abs, name, body) {
  const rec = read(abs);
  // BEGIN 按前缀匹配，允许行尾追加说明文字；END 必须完整
  const b = rec.text.indexOf(`<!-- AUTO:${name}:BEGIN`);
  const e = rec.text.indexOf(`<!-- AUTO:${name}:END -->`);
  if (b === -1 || e === -1) {
    console.warn(`  !! ${relative(ROOT, abs)} 缺少 ${name} 标记，跳过`);
    return;
  }
  const bLineEnd = rec.text.indexOf("\n", b);
  const next = rec.text.slice(0, bLineEnd + 1) + body + "\n" + rec.text.slice(e);
  if (next !== rec.text) {
    rec.text = next;
    rec.dirty = true;
  }
}

// ---------- 主流程 ----------

const directionsDir = join(ROOT, "directions");
const dirs = {};

for (const name of readdirSync(directionsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort()) {
  const abs = join(directionsDir, name);
  const d = scanDirection(abs);
  d.rel = `directions/${name}`;
  d.abs = abs;
  d.name = name;

  // 从方向 README 的任务表里取中文名，供 COLLECTION 用
  d.taskLabels = {};
  d.taskOrder = []; // 按方向 README 任务表的出现顺序，即约定的阅读顺序
  const readmeAbs = join(abs, "README.md");
  if (existsSync(readmeAbs)) {
    const text = readFileSync(readmeAbs, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\|\s*([^|]+?)\s*\|\s*`([a-z0-9-]+)`\s*\|/);
      if (m) {
        d.taskLabels[m[2]] = m[1];
        d.taskOrder.push(m[2]);
      }
    }
    // 显示名 = 目录序号 + README 的 H1，例如「01 AI+动物」
    const h1 = text.match(/^#\s+(.+?)\s*$/m)?.[1];
    const num = name.match(/^(\d+)-/)?.[1];
    d.display = [num, h1 ?? name].filter(Boolean).join(" ");
  } else {
    d.display = name;
  }
  dirs[name] = d;
}

const rootReadme = join(ROOT, "README.md");
inject(rootReadme, "OVERVIEW", blockOverview(dirs));

for (const d of Object.values(dirs)) {
  inject(join(d.abs, "README.md"), "COLLECTION", blockCollection(d, ""));

  // papers/ 下的每个任务、以及 datasets/ 和 surveys/，各自合并成一张总表。
  // papers/README.md 本身不加：它下面还有任务子目录，那些页面已经各有一张
  // 完整清单了，再加一张就是把同一批数据报第三遍。
  for (const [task, files] of Object.entries(d.papers)) {
    // 空的也生成（「（暂无收录）」）：不跳过，否则空任务的块会一直是空的，
    // 加了论文之后那一页仍是一片空白，看不出是没写还是脚本没跑
    injectIfPresent(join(d.abs, "papers", task, "README.md"), "INDEX", blockIndex(files, "篇"));
  }
  injectIfPresent(join(d.abs, "datasets", "README.md"), "INDEX", blockIndex(d.datasets, "个"));
  injectIfPresent(join(d.abs, "surveys", "README.md"), "INDEX", blockIndex(d.surveys, "篇"));
}

// ---------- 落盘 / 检查 ----------

const changed = [...FILES.entries()].filter(([, r]) => r.dirty);

if (CHECK) {
  if (changed.length) {
    console.error("统计块已过期，请运行 `node scripts/gen-index.mjs` 后提交：");
    for (const [abs] of changed) console.error("  " + relative(ROOT, abs));
    process.exit(1);
  }
  console.log(`统计块均为最新 ✓（检查了 ${FILES.size} 个文件）`);
} else {
  for (const [abs, r] of changed) writeFileSync(abs, r.text);
  console.log(
    changed.length
      ? `已更新 ${changed.length} 个文件的统计块：\n` +
          changed.map(([abs]) => "  " + relative(ROOT, abs)).join("\n")
      : `统计块已是最新，无需改动（检查了 ${FILES.size} 个文件）`
  );
}
