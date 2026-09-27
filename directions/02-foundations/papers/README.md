# 论文

按**任务**分子目录，每个任务目录内再按**发表年份**分文件：

```text
papers/
├── action-recognition/
│   ├── 2015.md
│   └── 2024.md
└── vision-language/
    └── 2021.md
```

**任务目录有内容了才创建**，不要预先建空目录。任务清单见 [方向 README](../README.md#任务分类)。

新建年份文件时，直接复制 [`templates/papers-year.md`](../../../templates/papers-year.md)。

| 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- |
| [论文完整标题](https://arxiv.org/abs/2501.01234) | CVPR 2026 | [代码](https://github.com/xxx/yyy) | 提出了 XXX 方法，在 YYY 任务上把 ZZZ 指标提升了 N 个点。 |

- 「发表」填**正式发表年**；只有 arXiv 预印本就写 `arXiv 2026`。
- 链接优先用 `arxiv.org/abs/...`，**不要**贴 `pdf` 结尾的链接。
- 没有开源代码就填 `—`。

完整规范见 [CONTRIBUTING.md](../../../CONTRIBUTING.md#加一篇论文)。
