# 姿态估计

动物关键点检测与三维姿态/形状恢复。

> 📌 **本任务只收「提出新方法」的论文。** 数据集论文（[AP-10K](../../datasets/2021.md)、[APT-36K](../../datasets/2022.md)、
> [APTv2](../../datasets/2023.md)、[Animal3D](../../datasets/2023.md)）统一放在 [`datasets/`](../../datasets/)。
> 判断标准见 [方向说明](../../README.md)——**如果是「我们发布了某数据集」就归数据集，是「我们提出了某方法」才归这里。**

## 这条线的核心矛盾

动物姿态估计的困难**不在模型，在标注**。人体姿态有大规模标注和成熟的参数化模型（SMPL），动物没有：
物种上千、形态差异大、关键点定义不统一、请专家标注极贵。所以这条线上的工作几乎都在回答同一个问题——
**怎么在标注很少甚至没有的情况下拿到可用的动物关键点。**

按这个视角读，四条路线一目了然：

| 路线 | 代表工作 | 思路 |
| --- | --- | --- |
| 跨域适应 | [Cross-Domain Adaptation](2019.md) | 从合成数据/其他物种迁移 |
| 视觉-语言对齐 | [CLAMP](2023.md)、[DiffPose-Animal](2025.md) | 用文本描述当桥梁，泛化到新物种 |
| 三维参数化 | [AniMer](2025.md)、[AniMer+](2025.md) | 把 SMPL 那套搬到动物，恢复姿态+形状 |
| 数据合成 | [AP-CAP](2025.md) | 直接造带标注的训练数据 |

## 建议阅读顺序

1. **[Cross-Domain Adaptation（2019）](2019.md)**——先看问题是怎么被定义的。
2. **[CLAMP（2023）](2023.md)**——视觉-语言这条线，是当前最有希望解决「新物种零样本」的方向。
3. **[AniMer（2025）](2025.md)**——三维路线的最新代表，**如果只读一篇读这篇**。
4. **[AP-CAP（2025）](2025.md)**——数据侧的解法，和上面几条正交，可组合。

## 本任务收录

<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
共 6 篇。

| 年份 | 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- | --- |
| [2025](2025.md) | [AniMer: Animal Pose and Shape Estimation Using Family Aware Transformer](https://arxiv.org/abs/2412.00837) | CVPR 2025 | — | 用科属感知的 Transformer 从单张图像恢复动物的三维姿态与形状，把人体参数化模型那套思路迁移到动物。 |
| [2025](2025.md) | [AniMer+: Unified Pose and Shape Estimation Across Mammalia and Aves via Family-Aware Transformer](https://arxiv.org/abs/2508.00298) | TPAMI 2025 | — | AniMer 的期刊扩展版，把统一建模范围从哺乳纲扩到鸟纲，并补充了更大规模的跨物种评测。 |
| [2025](2025.md) | [DiffPose-Animal: A Language-Conditioned Diffusion Framework for Animal Pose Estimation](https://arxiv.org/abs/2508.08783) | arXiv 2025 | — | 把姿态估计建模成以语言为条件的扩散生成过程，用文本描述引导关键点预测。 |
| [2025](2025.md) | [AP-CAP: Advancing High-Quality Data Synthesis for Animal Pose Estimation via a Controllable Image Synthesis Pipeline](https://arxiv.org/abs/2504.00394) | arXiv 2025 | — | 用可控图像合成流水线批量生成带关键点标注的动物图像，直接缓解姿态标注数据稀缺的问题。 |
| [2023](2023.md) | [CLAMP: Prompt-based Contrastive Learning for Connecting Language and Animal Pose](https://arxiv.org/abs/2206.11752) | CVPR 2023 | — | 用文本提示加对比学习把语言描述与动物关键点对齐，使模型能泛化到训练时没见过的物种。 |
| [2019](2019.md) | [Cross-Domain Adaptation for Animal Pose Estimation](https://arxiv.org/abs/1908.05806) | ICCV 2019 Oral | — | 用跨域适应把在合成数据上学到的姿态模型迁移到真实动物视频上，绕开动物关键点标注昂贵这一核心瓶颈。 |
<!-- AUTO:INDEX:END -->

## 相关任务

- [行为识别](../behavior/)——姿态是关键点级别的表征，常作为行为识别的中间表示。
- [个体重识别](../re-identification/)——同一段视频里，姿态与个体 ID 往往需要联合求解。
- 通用姿态方法见 02-foundations 的 `pose-estimation` 任务（待建）。
