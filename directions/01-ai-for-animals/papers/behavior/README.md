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

## 本任务收录

<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
共 7 篇。

| 年份 | 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- | --- |
| [2026](2026.md) | [PriVi: Towards A General-Purpose Video Model For Primate Behavior In The Wild](https://arxiv.org/abs/2511.09675) | CVPR 2026 | — | 面向野外灵长类行为训练通用视频模型，目标是跨物种、跨场景复用同一套行为理解骨干。 |
| [2026](2026.md) | [Toward Optimal Sampling Rate Selection and Unbiased Classification for Precise Activity Recognition of Farm Quadruped Animals](https://doi.org/10.1016/j.compag.2026.112103) | COMPAG 2026 | — | 提出 IBA-Net 等方法按行为自适应融合不同采样率特征，并通过无偏/校准分类减轻农场四足动物活动识别中的类别不平衡。 |
| [2025](2025.md) | [Domain-Adaptive Pretraining Improves Primate Behavior Recognition](https://arxiv.org/abs/2509.12193) | CVPR 2025 Workshop (CV4Animals) | — | 用领域自适应预训练缩小通用视频模型与野外灵长类视频之间的域差距，在小样本行为识别上取得提升。 |
| [2025](2025.md) | [AnimalMotionCLIP: Embedding motion in CLIP for Animal Behavior Analysis](https://arxiv.org/abs/2505.00569) | CV4Animals Workshop 2025 | — | 在 CLIP 的表征里显式注入运动信息，弥补图像-文本预训练模型对时序行为不敏感的缺陷。 |
| [2025](2025.md) | [Fine-Tuning Video-Text Contrastive Model for Primate Behavior Retrieval from Unlabeled Raw Videos](https://arxiv.org/abs/2505.05681) | arXiv 2025 | — | 用视频-文本对比模型的微调做行为检索，把「找某类行为的片段」变成文本查询问题，绕开逐帧标注。 |
| [2024](2024.md) | [AlphaChimp: Tracking and Behavior Recognition of Chimpanzees](https://arxiv.org/abs/2410.17136) | arXiv 2024 | — | 在 ChimpACT 数据集上把黑猩猩的多目标跟踪与行为识别串成一条管线，解决长视频里个体身份与行为标签的对应问题。 |
| [2021](2021.md) | [Video-based cattle identification and action recognition](https://arxiv.org/abs/2110.07103) | DICTA 2021 | — | 在牛场监控视频上同时做个体识别与动作识别，是较早把这两件事放进同一套视频管线的工作。 |
<!-- AUTO:INDEX:END -->

## 相关任务

- [姿态估计](../pose-estimation/)——关键点序列常作为行为识别的中间表征。
- [个体重识别](../re-identification/)——先认准「是谁」，才能谈「它在做什么」。
- 多目标跟踪（`tracking`，待建）——群体场景下行为识别的必要前置。
