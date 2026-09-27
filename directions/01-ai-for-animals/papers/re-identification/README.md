# 个体重识别

识别「这是哪一只」——动物个体级身份识别，区别于物种分类，也区别于通用行人 Re-ID。

> 📌 **本任务只收「提出新方法」的论文。** 数据集与工具包（[WildlifeDatasets](../../datasets/2023.md)、
> [WildlifeReID-10k](../../datasets/2024.md)、[Multispecies Animal Re-ID](../../datasets/2024.md)）统一放在
> [`datasets/`](../../datasets/)。通用行人 Re-ID 方法见 [02-foundations](../../../02-foundations/)（待建）。

## 为什么不能直接套用行人 Re-ID

行人 Re-ID 的前提在动物场景大多不成立：

| 行人 Re-ID 的假设 | 动物场景的现实 |
| --- | --- |
| 有大量标注 ID 的训练集 | 每个物种通常只有几十到几百个已知个体 |
| 测试时出现的 ID 在训练集中 | 几乎总是要识别**没见过的新个体** |
| 外观差异主要体现在衣着 | 同一只动物在不同季节/年龄外观会变 |
| 单一物种 | 需要跨物种泛化 |

所以这条线的关键词是**泛化**而不是**精度**——[OpenAnimals](2024.md) 整篇就是在论证这一点。

## 两条技术路线

| 路线 | 做法 | 代表 |
| --- | --- | --- |
| 全身纹理匹配 | 用身体花纹（斑马条纹、鲸鱼尾鳍）做相似度学习 | [Similarity Learning Networks](2020.md)、[WildFusion](2024.md) |
| 跨物种表征迁移 | 学一个与物种无关的身份表征 | [OpenAnimals](2024.md)、[Cross-Species Re-ID](2026.md) |

另有**面部识别**一条独立线（`face-identification`，待建）——灵长类、大型猫科的面部特征比全身更稳定。

## 建议阅读顺序

1. **[Similarity Learning Networks（2020）](2020.md)**——先看这条线最基础的形式：相似度网络 + 人类水平对比。
2. **[OpenAnimals（2024）](2024.md)**——**如果只读一篇读这篇**，它把「为什么行人 Re-ID 那套不够用」讲得最清楚。
3. **[Cross-Species Re-ID（2026）](2026.md)**——最新的跨物种泛化路线。
4. **[WildFusion（2024）](2024.md)**——工程视角，看多特征融合与概率校准怎么做。

## 年份索引

<!-- AUTO:YEARS:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
| 年份 | 文件 |
| --- | --- |
| 2026 | [1 篇](2026.md) — Cross-Species Animal Re-Identification with Semantic Consistency Learning |
| 2025 | [1 篇](2025.md) — OpenAnimals: Revisiting Person Re-Identification for Animals Towards Better Generalization |
| 2024 | [2 篇](2024.md) — WildFusion: Individual Animal Identification with Calibrated Similarity Fusion、WildlifeDatasets: An open-source toolkit for animal re-identification |
| 2020 | [1 篇](2020.md) — Similarity Learning Networks for Animal Individual Re-Identification — Beyond the Capabilities of Human Observers |
<!-- AUTO:YEARS:END -->

## 相关任务

- 面部与个体识别（`face-identification`，待建）——一条独立且互补的技术线。
- [姿态估计](../pose-estimation/)——姿态可作为去除外观干扰的身份线索。
- 检测、计数与种群调查（`detection-counting`，待建）——个体识别是「数清楚有多少只」的前提。
