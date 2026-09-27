# 论文

> 📌 **本目录目前是空的。**

按**任务**分子目录，每个任务目录内再按**发表年份**分文件：

```text
papers/
├── behavior/
│   ├── 2026.md
│   └── 2025.md
└── pose-estimation/
    └── 2021.md
```

**任务目录有内容了才创建**，不要预先建空目录。完整任务清单见 [方向 README](../README.md#任务分类)。

新建年份文件时，直接复制 [`templates/papers-year.md`](../../../templates/papers-year.md)。

| 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- |
| [论文完整标题](https://arxiv.org/abs/2501.01234) | CVPR 2026 | [代码](https://github.com/xxx/yyy) | 提出了 XXX 方法，在 YYY 任务上把 ZZZ 指标提升了 N 个点。 |

## 收录判定

**主实验跑在动物数据集上**（Animal Kingdom、AP-10K、LoTE-Animal…）→ 放这里。
用 COCO / ImageNet / Kinetics / MOT17 等通用基准的 → 放 [02-foundations](../../02-foundations/papers/)。

拿不准就按数据集判断，别纠结。

完整规范见 [CONTRIBUTING.md](../../../CONTRIBUTING.md#加一篇论文)。
