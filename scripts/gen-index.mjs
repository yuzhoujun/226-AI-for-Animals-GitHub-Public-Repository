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
//   YEARS        任务 README 的年份索引（从各年份文件里抽取标题）
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

/** 只数正文表格里的条目行：以「| [」开头，排除表头与分隔行 */
function entries(file) {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^\|\s*\[/.test(l))
    .map((l) => {
      const m = l.match(/^\|\s*\[([^\]]+)\]/);
      return { title: m ? m[1] : "?" };
    });
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
  const papers = {};
  for (const task of taskDirs(dir)) {
    const files = yearFiles(join(dir, "papers", task)).map((f) => ({
      year: f.replace(/\.md$/, ""),
      file: f,
      items: entries(join(dir, "papers", task, f)),
    }));
    papers[task] = files;
  }
  const surveys = yearFiles(join(dir, "surveys")).map((f) => ({
    year: f.replace(/\.md$/, ""),
    file: f,
    items: entries(join(dir, "surveys", f)),
  }));
  const datasets = yearFiles(join(dir, "datasets")).map((f) => ({
    year: f.replace(/\.md$/, ""),
    file: f,
    items: entries(join(dir, "datasets", f)),
  }));
  return { papers, surveys, datasets };
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

function blockYears(files) {
  // 年份倒序（新的在前），同名条目合并为「标题 ×N」
  const rows = [...files].reverse().map((f) => {
    const seen = new Map();
    for (const i of f.items) seen.set(i.title, (seen.get(i.title) ?? 0) + 1);
    const label = [...seen.entries()]
      .map(([t, n]) => (n > 1 ? `${t} ×${n}` : t))
      .join("、");
    return `| ${f.year} | [${f.items.length} 篇](${f.file}) — ${label} |`;
  });
  return ["| 年份 | 文件 |", "| --- | --- |", ...rows].join("\n");
}

// ---------- 写回 ----------

const FILES = new Map(); // abs path -> { text, dirty }

function read(abs) {
  if (!FILES.has(abs)) FILES.set(abs, { text: readFileSync(abs, "utf8"), dirty: false });
  return FILES.get(abs);
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
  for (const [task, files] of Object.entries(d.papers)) {
    if (!files.length) continue;
    inject(join(d.abs, "papers", task, "README.md"), "YEARS", blockYears(files));
  }
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
