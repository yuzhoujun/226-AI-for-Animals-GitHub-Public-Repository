# 把阅读站点挂到 226 服务器

GitHub Pages 国内访问经常很慢。这里再挂一份到教研室自己的服务器，国内同学打开就快了。
内容是同一份，构建流程也一样，只是换了个地方放。

> 不想折腾服务器的话**这一段可以整个跳过**——GitHub Pages 那份是自动的，不需要任何操作。

## 一次性准备

服务器上要有 `git`、`node`（18+）、`python3`（3.9+）和 `nginx`：

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install -y git nginx python3 python3-venv

# Node 18+ 建议用 nodesource 装，发行版自带的一般太旧
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 部署

```bash
# 1. 先把脚本拿下来（在服务器上）
sudo mkdir -p /srv/ai-animals-site
sudo chown "$USER" /srv/ai-animals-site
git clone https://github.com/yuzhoujun/226-AI-for-Animals-GitHub-Public-Repository.git /srv/ai-animals-site/repo

# 2. 跑部署。SITE_URL 必须和 nginx 里配的路径一致
cd /srv/ai-animals-site/repo
SITE_URL=https://<你的域名>/ai-animals/ ./scripts/server/deploy.sh
```

跑完站点在 `/srv/ai-animals-site/current/`。

## 配 nginx

复制 [`nginx.conf.example`](nginx.conf.example) 到 `/etc/nginx/conf.d/ai-animals.conf`，
改掉 `server_name`，然后：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

配置里几个**容易配错、配错了会白屏或链接全断**的地方，文件里都写了注释：

- `SITE_URL` 的前缀要和 `location` 的路径一致。挂 `/ai-animals/` 就填
  `https://域名/ai-animals/`。站内导航用的是相对链接，填错了页面一般还能翻，
  但 canonical、sitemap 和搜索索引的基准路径会指错。
- `root`/`alias` 指向的是 `current` 软链接，不是具体版本目录。这样部署时
  切一下软链接就生效，不用 reload nginx。

## 自动更新

想让服务器跟着 `main` 自动更新，加一个 systemd timer，每 15 分钟跑一次：

```ini
# /etc/systemd/system/ai-animals-deploy.service
[Unit]
Description=更新 AI+动物 文献站点
After=network-online.target

[Service]
Type=oneshot
User=<你的用户名>
Environment=SITE_URL=https://<你的域名>/ai-animals/
ExecStart=/srv/ai-animals-site/repo/scripts/server/deploy.sh
```

```ini
# /etc/systemd/system/ai-animals-deploy.timer
[Unit]
Description=定时更新 AI+动物 文献站点

[Timer]
OnBootSec=5min
OnUnitActiveSec=15min
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ai-animals-deploy.timer
systemctl list-timers ai-animals-deploy.timer   # 确认装上了
```

> 也可以直接挂个 cron：
> `*/15 * * * * SITE_URL=https://域名/ai-animals/ /srv/ai-animals-site/repo/scripts/server/deploy.sh >> /var/log/ai-animals.log 2>&1`
>
> 用 systemd 更好，日志能用 `journalctl -u ai-animals-deploy` 看。

## 版本与回滚

每次部署会新建 `releases/<UTC 时间戳>/`，然后把 `current` 软链接切过去，默认保留最近 5 个。
构建失败时软链接不会动，**线上还是上一个能用的版本**（构建用的是 `mkdocs build --strict`，
链接指错或锚点对不上会直接失败，坏站点上不了线）。

回滚就是把软链接切回去：

```bash
ls -1dt /srv/ai-animals-site/releases/*/ | head -3   # 看有哪些版本
ln -sfn /srv/ai-animals-site/releases/<要回滚到的> /srv/ai-animals-site/current
```

## 这个检出不要改

服务器上那份是**部署目标**，不是开发副本。`deploy.sh` 每次都会
`git reset --hard origin/main`，本地改动会被丢掉。要改内容请在 GitHub 上改，
或者本地拉到提 PR——见 [CONTRIBUTING.md](../../CONTRIBUTING.md)。
