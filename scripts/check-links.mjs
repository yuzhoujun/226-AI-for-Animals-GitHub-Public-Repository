#!/usr/bin/env node
// 仓库内相对链接检查：确认每个 [文字](相对路径) 都指向真实存在的文件或目录。
//
//   node scripts/check-links.mjs
//
// 外链（http/https/mailto）交给 lychee（见 .github/workflows/link-check.yml），这里只管仓库内部。
// 指向尚未创建的任务目录（`xxx`，待建）会失败——这类引用请写成纯文本，不要做成链接。

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".git", ".claude"]);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

let checked = 0;
const bad = [];

for (const file of walk(ROOT)) {
  // 去掉围栏代码块和行内代码，避免把文档里的示例链接当成真链接
  const text = readFileSync(file, "utf8")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "");

  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[1].trim();
    if (/^(https?:|mailto:|#)/.test(raw)) continue; // 外链与页内锚点跳过
    const target = raw.split("#")[0];
    if (!target) continue;
    checked++;
    if (!existsSync(resolve(dirname(file), decodeURIComponent(target)))) {
      bad.push(`${relative(ROOT, file)}  ->  ${raw}`);
    }
  }
}

if (bad.length) {
  console.error(`检查了 ${checked} 条相对链接，${bad.length} 条失效：\n`);
  for (const b of bad) console.error("  " + b);
  console.error("\n指向尚未创建的目录时，请改写成纯文本（如 `tracking`，待建）而不是链接。");
  process.exit(1);
}
console.log(`相对链接全部有效 ✓（${checked} 条）`);
