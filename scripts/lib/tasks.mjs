// 方向 README 里那张「任务分类」表，是**任务的登记处**。
//
// 一个任务先在这张表里占一行（中文名 / 目录名 / 说明 / 状态），目录可以晚点再建——
// 没建的状态就叫「待建」。所以「加一个任务」跟「建一个目录」是两件事：
// 表中已有、状态待建的任务，直接投第一篇论文就会把目录带出来。
//
// 这张表现在有三个消费者：
//   gen-index.mjs   生成统计块时要读中文名和排列顺序
//   gen-forms.mjs   生成 Issue 表单的任务下拉框
//   issue-to-pr.mjs 判断选中的任务是否已登记、取中文名写进标题
//
// 三处各写各的正则，迟早会出现「同一个任务，三处有三种理解」。统一放这里。

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** 任务行：| 中文名 | `目录名` | 说明 | 状态 | */
const ROW = /^\|\s*([^|]+?)\s*\|\s*`([a-z0-9-]+)`\s*\|/;

/** 一行任务行的四个格子（已 trim，不含首尾的竖线） */
function cellsOf(line) {
  return line
    .replace(/\r$/, "")
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

/** 这行是不是任务行？是就给出目录名，不是给 null */
export function taskSlugOf(line) {
  return line.match(ROW)?.[2]?.trim() ?? null;
}

/**
 * 换掉任务行的「状态」那一格，其余三格原样保留（连空格都不动）。
 * 不是任务行返回 null，调用方据此跳过。
 */
export function setStatus(line, status) {
  if (!ROW.test(line)) return null;
  const cr = line.endsWith("\r") ? "\r" : "";
  const parts = line.slice(0, line.length - cr.length).split("|");
  if (parts.length < 6) return null; // 不是四格的任务行，别乱动
  parts[parts.length - 2] = ` ${status} `;
  return parts.join("|") + cr;
}

/**
 * 读一个方向：一级标题 + 任务分类表里的全部任务。
 * 目录不存在或 README 缺失时返回空表，由调用方决定是报错还是跳过。
 */
export function readDirection(abs) {
  const p = join(abs, "README.md");
  const text = existsSync(p) ? readFileSync(p, "utf8") : "";
  const tasks = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(ROW);
    if (!m) continue;
    const cells = cellsOf(line);
    tasks.push({
      label: m[1].trim(), // 中文名
      slug: m[2].trim(), // 目录名
      note: cells[2] ?? "", // 说明
      status: cells[3] ?? "", // 状态（由 gen-index.mjs 填，见那里的说明）
      line,
    });
  }
  return { title: text.match(/^#\s+(.+?)\s*$/m)?.[1] ?? null, tasks };
}

/** 读 directions/ 下全部方向，按目录名排序 */
export function readDirections(root) {
  const base = join(root, "directions");
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .map((name) => ({ name, abs: join(base, name), ...readDirection(join(base, name)) }));
}
