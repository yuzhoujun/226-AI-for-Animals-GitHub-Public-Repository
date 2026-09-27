#!/usr/bin/env node
// 生成 mkdocs.yml 里的 nav。
//
//   node scripts/gen-nav.mjs          重写 nav
//   node scripts/gen-nav.mjs --check  只检查，过期则退出码 1（CI 用）
//
// 为什么不写 nav 不行：MkDocs 的隐式导航**只认目录名**，把 `01-ai-for-animals`
// 变成「01 ai for animals」、`datasets` 变成「Datasets」。目录里的 index.md 只管
// 当落地页，它的 H1 不会变成节标题。于是侧边栏成了「Directions / Datasets /
// Papers / Behavior」——里面的页面标题全是中文，外面包着的那层全是英文，很突兀。
//
// 而目录名必须是英文小写（链接、URL 要用，CONTRIBUTING 里定的），所以只能显式写
// nav 把标题换掉。nav 又不该手写：新增一个任务目录就要记得回来加一段，
// 忘了不会有任何报错。所以照旧由脚本从目录结构 + 各目录 README 的 H1 推出来。
//
// 标记之间整段由本脚本接管，不要手改：
//   # AUTO:NAV:BEGIN
//   ...
//   # AUTO:NAV:END

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { readDirections } from "./lib/tasks.mjs";

const ROOT = join(import.meta.dirname, "..");
const CHECK = process.argv.includes("--check");
const TARGET = join(ROOT, "mkdocs.yml");
const BEGIN = "# AUTO:NAV:BEGIN";
const END = "# AUTO:NAV:END";

/** 节标题取该目录 README 的 H1；没有就退回给的名字 */
function titleOf(abs, fallback) {
  const m = existsSync(abs) ? readFileSync(abs, "utf8").match(/^#\s+(.+?)\s*$/m) : null;
  return m ? m[1] : fallback;
}

/**
 * 目录下的页面，新的在前（和 README 收录表的顺序一致）。
 *
 * 年份文件的标题是「行为识别与理解 · 2021 年论文」，而它上面那一节就叫
 * 「行为识别与理解」，直接拿 H1 会在导航里重复一遍，所以这里只用年份。
 * **文档本身的标题没动**，点进去还是完整的那句。
 */
function pageNodes(absDir, relBase) {
  if (!existsSync(absDir)) return [];
  return readdirSync(absDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort()
    .reverse()
    .map((f) => {
      const year = f.match(/^(\d{4})\.md$/);
      return {
        label: year ? year[1] : titleOf(join(absDir, f), f.replace(/\.md$/, "")),
        path: `${relBase}/${f}`,
      };
    });
}

/** 一个方向：README 当落地页，下面分「论文 / 综述 / 数据集」 */
function directionNode(d) {
  const base = `directions/${d.name}`;
  const children = [];

  // 论文：任务按方向 README 任务表的顺序（那是约定的阅读顺序，字母序不是）
  const papersAbs = join(d.abs, "papers");
  const onDisk = existsSync(papersAbs)
    ? readdirSync(papersAbs, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : [];
  const inTable = d.tasks.map((t) => t.slug).filter((s) => onDisk.includes(s));
  // 建了目录却没在表里登记的排到最后（gen-index 会在状态列标出来，这里不藏）
  const notInTable = onDisk.filter((s) => !inTable.includes(s)).sort();
  const taskNodes = [...inTable, ...notInTable].map((slug) => ({
    label: d.tasks.find((t) => t.slug === slug)?.label ?? slug,
    index: `${base}/papers/${slug}/index.md`,
    children: pageNodes(join(papersAbs, slug), `${base}/papers/${slug}`),
  }));
  if (taskNodes.length) children.push({ label: "论文", children: taskNodes });

  for (const [sub, fallback] of [
    ["surveys", "综述"],
    ["datasets", "数据集"],
  ]) {
    const abs = join(d.abs, sub);
    const kids = pageNodes(abs, `${base}/${sub}`);
    const readme = join(abs, "README.md");
    if (!kids.length && !existsSync(readme)) continue;
    children.push({
      label: titleOf(readme, fallback),
      index: existsSync(readme) ? `${base}/${sub}/index.md` : null,
      children: kids,
    });
  }

  return { label: d.title ?? d.name, index: `${base}/index.md`, children };
}

// ---------- 组装 ----------

const nodes = [
  { label: "首页", path: "index.md" },
  { label: titleOf(join(ROOT, "CONTRIBUTING.md"), "如何添加内容"), path: "CONTRIBUTING.md" },
  {
    label: titleOf(join(ROOT, "directions", "README.md"), "研究方向"),
    index: "directions/index.md",
    children: readDirections(ROOT).map(directionNode),
  },
];

const q = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function emit(list, pad = "  ") {
  const out = [];
  for (const n of list) {
    if (n.path !== undefined) {
      out.push(`${pad}- ${q(n.label)}: ${n.path}`);
      continue;
    }
    out.push(`${pad}- ${q(n.label)}:`);
    const inner = pad + "    ";
    // 落地页写成裸路径，material 的 navigation.indexes 靠这个把节标题变成可点的链接
    if (n.index) out.push(`${inner}- ${n.index}`);
    out.push(...emit(n.children, inner));
  }
  return out;
}

const body = ["nav:", ...emit(nodes)].join("\n");

// ---------- 写回 / 检查 ----------

const text = readFileSync(TARGET, "utf8");
const b = text.indexOf(BEGIN);
const e = text.indexOf(END);
if (b === -1 || e === -1) {
  console.error(`${relative(ROOT, TARGET)} 里找不到 ${BEGIN} / ${END} 标记。`);
  process.exit(1);
}

const bLineEnd = text.indexOf("\n", b);
const eLineStart = text.lastIndexOf("\n", e) + 1;
const next = text.slice(0, bLineEnd + 1) + body + "\n" + text.slice(eLineStart);

if (CHECK) {
  if (next !== text) {
    console.error(
      "站点导航已过期，请运行 `node scripts/gen-nav.mjs` 后提交。\n" +
        "（多半是新增/删除/改名了任务目录，或者某个 README 的一级标题改了。）"
    );
    process.exit(1);
  }
  console.log(`站点导航是最新的 ✓（${nodes.length} 个顶层条目）`);
} else if (next !== text) {
  writeFileSync(TARGET, next);
  console.log(`已更新 ${relative(ROOT, TARGET)} 的导航（${nodes.length} 个顶层条目）`);
} else {
  console.log(`站点导航已是最新，无需改动（${nodes.length} 个顶层条目）`);
}
