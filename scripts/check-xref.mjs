#!/usr/bin/env node
// 正文交叉引用检查：手写正文里指向年份文件（YYYY.md）的链接，指向的那一条
// 必须真的在那个文件里。
//
//   node scripts/check-xref.mjs
//
// 为什么需要这个：统计块（AUTO:XXX）是脚本生成的，不会错。会错的是它旁边
// 手写的那段话——比如「如果只读一篇读 [OpenAnimals](2024.md)」。哪天这篇
// 按发表年挪到了 2025.md，统计块跟着更新了，手写正文不会，于是同一页上
// 正文说 2024、统计说 2025，自相矛盾。
//
// check-links.mjs 抓不到这种错：2024.md 这个文件确实存在，只是里面没有
// OpenAnimals。所以这里查的不是「文件在不在」，而是「那一条在不在」。
//
// 链接文字要求用**完整标题**（或至少是标题的开头一段）。因为只有这样脚本
// 才认得出来——「Cross-Species Re-ID」这种掐头去尾的缩写对不上全名
// 「Cross-Species Animal Re-Identification with...」，脚本没法猜。
// 表格里空间不够就写纯文本简称、不加链接，读者从下方的年份索引点进去。

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".git", ".claude", ".site-src", "site"]);
const YEAR_FILE = /^\d{4}\.md$/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

// 去掉括号里的补充说明，只留可比较的主干：「OpenAnimals（2024）」→「openanimals」
const norm = (s) =>
  s
    .replace(/（[^）]*）|\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// 年份文件里每条都是表格的一行：| [标题](链接) | 发表 | 代码 | 贡献 |
function entriesOf(file) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return [];
  }
  return [...text.matchAll(/^\|\s*\[([^\]]+)\]\(/gm)].map((m) => norm(m[1]));
}

// 「2 篇」「3 个」这类是数量链接，不是指向某一条
const isCountLabel = (s) => /^\d+\s*[篇个条]$/.test(s);
// 「datasets/2023」这类链接文字本身就是路径，指的是文件不是某一条
const isPathLabel = (s) => s.includes("/") || s.endsWith(".md");

const errors = [];
const warnings = [];
let checked = 0;

for (const file of walk(ROOT)) {
  const text = readFileSync(file, "utf8")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "")
    // 统计块整段挖掉（连内容一起），只留手写正文
    .replace(/<!-- AUTO:\w+:BEGIN[\s\S]*?<!-- AUTO:\w+:END -->/g, "");

  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    const [, label, raw] = m;
    const target = raw.split("#")[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    if (!YEAR_FILE.test(basename(target))) continue;

    const label_n = norm(label);
    if (!label_n || label_n.length < 4 || isCountLabel(label_n) || isPathLabel(label_n)) continue;

    const abs = join(dirname(file), decodeURIComponent(target));
    const where = `${relative(ROOT, file)}  ->  ${raw}`;
    checked++;

    if (!existsSync(abs)) {
      errors.push(`${where}\n      文件不存在`);
      continue;
    }
    if (entriesOf(abs).some((t) => t.includes(label_n))) continue;

    // 不在这个文件里——看看是不是挪到同目录的别的年份去了
    const moved = readdirSync(dirname(abs))
      .filter((n) => YEAR_FILE.test(n) && join(dirname(abs), n) !== abs)
      .find((n) => entriesOf(join(dirname(abs), n)).some((t) => t.includes(label_n)));

    if (moved) {
      errors.push(`${where}\n      「${label}」在 ${moved} 里，不在这里`);
    } else {
      warnings.push(`${where}\n      在 ${basename(target)} 里找不到「${label}」`);
    }
  }
}

for (const w of warnings) console.warn(`⚠ 无法核对：${w}`);
if (warnings.length) {
  console.warn(
    "\n（核对不了通常是缩写对不上全名。把链接文字改成完整标题，" +
      "或者写成纯文本简称不加链接——见 CONTRIBUTING.md 的「正文里怎么引用某一条」。）\n"
  );
}

if (errors.length) {
  console.error(`检查了 ${checked} 条正文交叉引用，${errors.length} 条指错了：\n`);
  for (const e of errors) console.error("  ✗ " + e);
  console.error("\n这些条目多半是按发表年换了文件。把链接和文字里的年份一起改掉。");
  process.exit(1);
}

console.log(
  `正文交叉引用全部有效 ✓（${checked} 条${warnings.length ? `，${warnings.length} 条无法核对` : ""}）`
);
