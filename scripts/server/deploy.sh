#!/usr/bin/env bash
#
# 把阅读站点部署到 226 服务器（或任何一台能访问 GitHub 的 Linux 机器）。
#
#   ./scripts/server/deploy.sh
#
# 为什么要有这个：GitHub Pages 在国内访问经常很慢甚至打不开。教研室自己有一台
# 有公网入口的服务器，在这里再挂一份，国内同学打开就快了。
#
# 做法是「构建到新目录 + 切软链接」，不是直接往网站根目录里 rsync：
# 构建要几十秒，直接覆盖的话这期间访问的人会看到一个缺胳膊少腿的站点。
# 切软链接是原子的，而且旧版本还在 releases/ 里，回滚就是再切一次。
#
# 所有路径都可以用环境变量覆盖，改域名/目录不用动这个文件：
#
#   DEPLOY_ROOT  部署根目录，默认 /srv/ai-animals-site
#   REPO_DIR     仓库检出位置，默认 $DEPLOY_ROOT/repo
#   SITE_URL     对外访问地址，**必须和你 nginx 里配的路径一致**
#   KEEP         保留多少个历史版本，默认 5
#   BRANCH       跟踪哪个分支，默认 main

set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/srv/ai-animals-site}"
REPO_DIR="${REPO_DIR:-$DEPLOY_ROOT/repo}"
SITE_URL="${SITE_URL:?请设置 SITE_URL，例如 SITE_URL=https://example.edu/ai-animals/}"
KEEP="${KEEP:-5}"
BRANCH="${BRANCH:-main}"

RELEASES="$DEPLOY_ROOT/releases"
VENV="$DEPLOY_ROOT/venv"
REPO_URL="${REPO_URL:-https://github.com/yuzhoujun/226-AI-for-Animals-GitHub-Public-Repository.git}"

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m!!\033[0m %s\n' "$*" >&2; exit 1; }

# ---------- 依赖检查 ----------
# 早点报错，别构建到一半才发现缺东西

for cmd in git node python3; do
  command -v "$cmd" >/dev/null || die "缺少 $cmd，请先装上"
done

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "Node 版本太低（$(node -v)），脚本用了较新的语法，需要 18+"

mkdir -p "$DEPLOY_ROOT" "$RELEASES"

# ---------- 取代码 ----------
# 这台机器上的检出是**部署目标**，不是开发副本：本地改动一律丢弃，
# 以远端为准。别在这里改东西——改了下次部署就没了。

if [ -d "$REPO_DIR/.git" ]; then
  log "拉取 $BRANCH"
  git -C "$REPO_DIR" fetch --prune origin
  git -C "$REPO_DIR" checkout -q "$BRANCH"
  git -C "$REPO_DIR" reset --hard "origin/$BRANCH"
  git -C "$REPO_DIR" clean -qfd
else
  log "首次部署，克隆仓库"
  # GIT_LFS_SKIP_SMUDGE 是防御性的：这个仓库明确不放二进制文件，
  # 万一哪天误提交了，也不至于在服务器上拉一堆没用的东西下来
  GIT_LFS_SKIP_SMUDGE=1 git clone -q --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
fi
log "当前版本：$(git -C "$REPO_DIR" log -1 --format='%h %s')"

# ---------- 构建 ----------
# mkdocs 装在独立 venv 里，不污染系统 python

if [ ! -x "$VENV/bin/python" ]; then
  log "创建 venv"
  python3 -m venv "$VENV"
fi
log "同步依赖"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q -r "$REPO_DIR/requirements.txt"

cd "$REPO_DIR"

# 仓库自检。失败只警告不中断——这属于内容问题，交给 CI 去拦，
# 不该因为这个让站点更新停摆。
log "仓库自检"
node scripts/gen-index.mjs --check || printf '\033[1;33m  ！统计块不是最新（CI 会失败，但不影响本次部署）\033[0m\n'
node scripts/check-links.mjs || printf '\033[1;33m  ！有失效的相对链接（CI 会失败，但不影响本次部署）\033[0m\n'

log "生成站点文档"
node scripts/build-site.mjs

TS="$(date -u +%Y%m%d-%H%M%S)"
OUT="$RELEASES/$TS"
log "构建到 releases/$TS（SITE_URL=$SITE_URL）"
# --strict：站内链接指错、锚点对不上就失败，不把坏站点切上线。
# 这一步失败会 set -e 退出，软链接还指着上一个版本，线上不受影响。
SITE_URL="$SITE_URL" "$VENV/bin/mkdocs" build --strict --site-dir "$OUT"

# 泄漏兜底：审核指南.md 是本地维护者文档，公开站点上出现即泄漏。
# build-site.mjs 已经用白名单挡过一次，这里再查一遍产物——发布前最后一道。
#
# 这里刻意不用 `find | grep -q`：grep -q 一命中就退出，find 会吃到 SIGPIPE 而以
# 非 0 退出，配合 set -o pipefail 整个管道就算失败——于是「查到了」反而被判成没查到。
# 直接拿 find 的输出，不经过管道。
leak="$(find "$OUT" -iname '*审核*' -print -quit)"
if [ -n "$leak" ]; then
  rm -rf "$OUT"
  die "产物里出现了审核指南相关的文件（$leak），已中止部署并清理。请检查 scripts/build-site.mjs 的白名单。"
fi

# ---------- 切换 ----------
log "切换软链接"
ln -sfn "$OUT" "$DEPLOY_ROOT/current"

# 清理旧版本，保留最近 $KEEP 个。
# 不用 `ls | tail | while read`：管道里的 while 在子 shell 里，而且同样有 pipefail 的坑。
cd "$RELEASES"
count=0
for old in $(ls -1dt */ 2>/dev/null || true); do
  count=$((count + 1))
  if [ "$count" -le "$KEEP" ]; then
    continue
  fi
  log "清理旧版本 $old"
  rm -rf "${old%/}"
done

log "完成 ✅  $(git -C "$REPO_DIR" log -1 --format='%h')"
echo
echo "网站根目录：$DEPLOY_ROOT/current  （nginx 的 root 指到这里）"
echo "回滚：把软链接切回上一个版本"
ls -1dt "$RELEASES"/*/ 2>/dev/null | head -3 | sed 's/^/  /'
