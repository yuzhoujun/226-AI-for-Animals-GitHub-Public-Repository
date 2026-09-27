#!/usr/bin/env node
// 生成 Issue 表单里那个任务下拉框的选项。
//
//   node scripts/gen-forms.mjs          重写下拉框
//   node scripts/gen-forms.mjs --check  只检查，过期则退出码 1（CI 用）
//
// 下拉框原本是手抄的，而且只抄了「已经有目录的」任务——于是方向 README 里
// 登记为「待建」的那批任务，在表单里根本选不到，想投第一篇论文的人无处可投。
// 手抄件还有第二个毛病：没人校验，建了目录忘记改 YAML 也不会有任何报错。
//
// 所以改成从这里生成：任务的唯一来源是方向 README 的「任务分类」表
// （见 scripts/lib/tasks.mjs），下拉框只是它的一份投影。
//
// 标记之间整段由本脚本接管，不要手改：
//   # AUTO:TASKS:BEGIN
//   ...
//   # AUTO:TASKS:END

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { readDirections } from "./lib/tasks.mjs";

const ROOT = join(import.meta.dirname, "..");
const CHECK = process.argv.includes("--check");
const TARGET = join(ROOT, ".github", "ISSUE_TEMPLATE", "add-paper.yml");
const BEGIN = "# AUTO:TASKS:BEGIN";
const END = "# AUTO:TASKS:END";

/**
 * 「01-ai-for-animals / behavior（行为识别与理解）」
 *
 * 待建的额外标一下：选它就是「这个任务从这篇开张」，和往已有任务里补一篇
 * 是两种不同的提交，选错了要返工。
 *
 * 「建没建」按目录在不在判断，不读表里那一格——那一格是 gen-index.mjs 生成的，
 * 读它就把两个脚本的先后顺序绑死了。
 */
function optionLine(dirName, task) {
  const built = existsSync(join(ROOT, "directions", dirName, "papers", task.slug));
  return `        - ${dirName} / ${task.slug}（${task.label}）${built ? "" : " — 待建"}`;
}

const options = readDirections(ROOT).flatMap((d) =>
  d.tasks.map((t) => optionLine(d.name, t))
);

if (!options.length) {
  console.error("没能从任何方向 README 的任务表里读出任务，标记大概被改坏了。");
  process.exit(1);
}

const text = readFileSync(TARGET, "utf8");
const b = text.indexOf(BEGIN);
const e = text.indexOf(END);
if (b === -1 || e === -1) {
  console.error(`${relative(ROOT, TARGET)} 里找不到 ${BEGIN} / ${END} 标记。`);
  process.exit(1);
}

// END 那行是缩进过的（在 YAML 的 options: 下面），从前一行的行首切起，
// 缩进才不会被吃掉
const bLineEnd = text.indexOf("\n", b);
const eLineStart = text.lastIndexOf("\n", e) + 1;
const next = text.slice(0, bLineEnd + 1) + options.join("\n") + "\n" + text.slice(eLineStart);

if (CHECK) {
  if (next !== text) {
    console.error(
      "任务下拉框已过期，请运行 `node scripts/gen-forms.mjs` 后提交。\n" +
        "（多半是方向 README 的任务表改了，或者某个任务建了目录、状态不再是「待建」。）"
    );
    process.exit(1);
  }
  console.log(`任务下拉框是最新的 ✓（${options.length} 个任务）`);
} else if (next !== text) {
  writeFileSync(TARGET, next);
  console.log(`已更新 ${relative(ROOT, TARGET)} 的任务下拉框（${options.length} 个任务）`);
} else {
  console.log(`任务下拉框已是最新，无需改动（${options.length} 个任务）`);
}
