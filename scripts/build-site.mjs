#!/usr/bin/env node
// 把仓库里的 markdown 暂存成 MkDocs 能吃的形式，输出到 .site-src/。
//
//   node scripts/build-site.mjs && mkdocs build
//
// 为什么需要这一步，而不是直接把仓库根当 docs_dir：
//
//   1. MkDocs 只把 index.md 当目录首页，我们用的是 README.md。
//      这里把每个 README.md 复制成 index.md，并把指向它的链接一起改写，
//      否则站点上所有「返回」「上级」链接都会 404。
//
//   2. 仓库根目录下有些文件不该出现在公开站点上（尤其是本地的审核指南.md）。
//      直接拿仓库根当 docs_dir 会在本地构建时把它们一起发布出去。
//      这里用白名单复制，从源头上杜绝。

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const STAGE = join(ROOT, ".site-src");

// 只复制这些（白名单）。仓库里出现新东西时默认不发布，比默认发布安全。
const INCLUDE_FILES = ["README.md", "CONTRIBUTING.md"];
const INCLUDE_DIRS = ["directions", "templates"];

// 绝不发布。审核指南是本地维护者文档，公开站点上出现即泄漏。
const NEVER = ["审核指南.md"];

// 站点上缺失、但 GitHub 上有意义的目录。指向它们的相对链接改写成绝对地址，
// 否则 MkDocs 会报「目标不在文档里」，读者点了也是 404。
const GITHUB_BLOB = "https://github.com/yuzhoujun/226-AI-for-Animals-GitHub-Public-Repository/blob/main";
const OFF_SITE_DIRS = [".github"];

// ---------- 链接改写 ----------

/** 把指向 README.md 的链接改写成 index.md，锚点保留 */
function rewriteLinks(text, relPath) {
  const rewritten = text.replace(/\]\(([^)\s]*?)README\.md(#[^)]*)?\)/g, (full, target, anchor = "") => {
    if (/^[a-z]+:\/\//i.test(target)) return full; // 外链不动
    return `](${target}index.md${anchor})`;
  });
  return rewriteOffSiteLinks(rewritten, relPath);
}

/**
 * 指向 OFF_SITE_DIRS 的相对链接（如 `.github/ISSUE_TEMPLATE/xxx.yml`）改成 GitHub 绝对地址。
 * 链接里的路径要相对当前文件解析，因为同一个目标在 README 和 directions/README 里
 * 分别写成了 `.github/...` 和 `../.github/...`。
 */
function rewriteOffSiteLinks(text, relPath) {
  const fromDir = dirname(relPath);
  return text.replace(/\]\(([^)\s]+)\)/g, (full, target) => {
    if (/^[a-z]+:\/\//i.test(target) || target.startsWith("#")) return full;
    const [pathPart, anchor = ""] = target.split("#");
    const resolved = relative(ROOT, join(ROOT, fromDir, pathPart)).replace(/\\/g, "/");
    const hit = OFF_SITE_DIRS.find((d) => resolved === d || resolved.startsWith(`${d}/`));
    if (!hit) return full;
    return `](${GITHUB_BLOB}/${resolved}${anchor ? `#${anchor}` : ""})`;
  });
}

// ---------- 复制 ----------

let copied = 0;
let skipped = 0;

function emit(srcAbs, relPath) {
  const base = relPath.split("/").pop();
  if (NEVER.includes(base)) {
    skipped++;
    return;
  }
  const outRel = base === "README.md" ? relPath.replace(/README\.md$/, "index.md") : relPath;
  const outAbs = join(STAGE, outRel);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, rewriteLinks(readFileSync(srcAbs, "utf8"), relPath));
  copied++;
}

function walkDir(absDir, relDir) {
  for (const e of readdirSync(absDir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const abs = join(absDir, e.name);
    const rel = `${relDir}/${e.name}`;
    if (e.isDirectory()) walkDir(abs, rel);
    else if (e.name.endsWith(".md")) emit(abs, rel);
  }
}

// ---------- 主流程 ----------

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });

for (const f of INCLUDE_FILES) {
  const abs = join(ROOT, f);
  if (existsSync(abs)) emit(abs, f);
}
for (const d of INCLUDE_DIRS) {
  const abs = join(ROOT, d);
  if (existsSync(abs)) walkDir(abs, d);
}

// 兜底检查：确认敏感文件确实没进暂存目录
const leaked = NEVER.filter((f) => {
  const stack = [STAGE];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of readdirSync(cur, { withFileTypes: true })) {
      if (e.isDirectory()) stack.push(join(cur, e.name));
      else if (e.name === f) return true;
    }
  }
  return false;
});

if (leaked.length) {
  console.error(`!! 敏感文件进入了站点暂存目录：${leaked.join(", ")}`);
  process.exit(1);
}

console.log(
  `站点文档已生成到 .site-src/（${copied} 个页面` +
    (skipped ? `，已排除 ${skipped} 个不发布文件` : "") +
    `）`
);
console.log("接下来：mkdocs build");
