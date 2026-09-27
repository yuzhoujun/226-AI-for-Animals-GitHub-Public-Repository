# 行为识别

动物行为识别与理解，本方向的核心任务。

> 📌 **本任务只收「提出新方法」的论文。** 行为数据集（[ChimpACT](../../datasets/2023.md)、
> [PanAf20K](../../datasets/2024.md)、[MammAlps](../../datasets/2025.md)）统一放在 [`datasets/`](../../datasets/)。

## 这条线的核心矛盾

和行为识别（通用视频动作识别，见 [02-foundations](../../../02-foundations/papers/action-recognition/)）相比，
动物行为识别多出三个特有困难：

| 困难 | 说明 |
| --- | --- |
| **标注贵且主观** | 行为类别的边界本身就模糊（「理毛」和「查看」怎么分？），需要动物学家标注 |
| **长尾极端** | 常见行为样本多，罕见但重要的行为（求偶、育幼、攻击）样本极少 |
| **时序跨度大** | 一个行为可能持续几秒到几分钟，逐帧分类的框架不合适 |

所以这条线当前的主流做法是**绕开逐帧标注**——用视觉-语言模型做检索、用自监督预训练做表征、
用领域自适应缩小通用模型与野外视频的差距。

## 技术路线

| 路线 | 做法 | 代表 |
| --- | --- | --- |
| 监督式行为分类 | 在标注数据集上直接训练分类器 | [AlphaChimp](2024.md)、[PriVi](2026.md) |
| 视觉-语言检索 | 用文本查询行为片段，不需要逐帧标签 | [Primate Behavior Retrieval](2025.md)、[AnimalMotionCLIP](2025.md) |
| 领域自适应 | 把通用视频模型适配到野外特定物种 | [Domain-Adaptive Pretraining](2025.md) |

**行为预测**（预测接下来会发生什么）是另一条更前沿的线，见 [02-foundations/papers/world-models/](../../../02-foundations/papers/world-models/)。

## 建议阅读顺序

1. **[Video-based cattle identification and action recognition（2021）](2021.md)**——先看最朴素的形态：识别 + 分类两条支路。
2. **[AlphaChimp（2024）](2024.md)**——看跟踪与行为识别怎么串起来，这是野外长视频的实际做法。
3. **[AnimalMotionCLIP（2025）](2025.md)**——**如果只读一篇读这篇**，它点出了 CLIP 类模型在行为任务上的根本缺陷（缺运动建模）。
4. **[PriVi（2026）](2026.md)**——最新进展，看通用行为模型这条线走到哪了。

## 年份索引

| 年份 | 论文 |
| --- | --- |
| 2021 | [Cattle identification and action recognition](2021.md) |
| 2024 | [AlphaChimp](2024.md) |
| 2025 | [Domain-Adaptive Pretraining](2025.md) · [AnimalMotionCLIP](2025.md) · [Primate Behavior Retrieval](2025.md) |
| 2026 | [PriVi](2026.md) |

## 相关任务

- [姿态估计](../pose-estimation/)——关键点序列常作为行为识别的中间表征。
- [个体重识别](../re-identification/)——先认准「是谁」，才能谈「它在做什么」。
- 多目标跟踪（`tracking`，待建）——群体场景下行为识别的必要前置。
