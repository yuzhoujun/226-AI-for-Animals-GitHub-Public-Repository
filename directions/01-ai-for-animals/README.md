# AI+动物

用计算机视觉与多模态方法理解动物：从个体识别、姿态估计，到细粒度行为理解与长时序行为分析。

## 研究范围

- 动物个体识别与重识别（Animal Re-ID）
- 动物姿态估计与关键点检测
- 动物行为识别与细粒度行为理解
- 长时序视频建模与动作识别
- 野生动物多模态监测（红外相机、无人机、声学）

**关键词**：animal behavior understanding, animal pose estimation, fine-grained action recognition, long-term video understanding, wildlife monitoring, video-language pretraining

## 目录导航

| 目录 | 内容 | 当前年份文件 |
| --- | --- | --- |
| [papers/](papers/) | 研究论文 | 见下方年度速览 |
| [surveys/](surveys/) | 综述与 Review | 见下方年度速览 |
| [datasets/](datasets/) | 公开数据集 | 见下方年度速览 |

## 年度速览

| 年份 | 论文 | 综述 | 数据集 |
| --- | --- | --- | --- |
| 2026 | — | — | — |
| 2025 | — | [3 篇](surveys/2025.md) | — |
| 2024 | [2 篇](papers/2024.md) | — | — |
| 2023 | [1 篇](papers/2023.md) | — | [1 个](datasets/2023.md) |
| 2022 | [1 篇](papers/2022.md) | — | [1 个](datasets/2022.md) |
| 2021 | [4 篇](papers/2021.md) | — | [1 个](datasets/2021.md) |
| 2020 | [1 篇](papers/2020.md) | — | — |
| 2019 | [1 篇](papers/2019.md) | — | — |
| 2015 | [1 篇](papers/2015.md) | — | — |

> 每加一个年份文件，就补一行链接。没列出的年份表示还没有收录内容。

## 建议阅读顺序

1. 先读 `surveys/` 里最近两年的综述，建立「这个方向在解决什么问题」的整体认识。
2. 再看 `datasets/`，明确任务定义、标注形式和评测指标——动物方向的难点往往在数据而不在模型。
3. 最后进 `papers/`，按 3D CNN → Transformer → 状态空间模型 → 视觉语言模型的技术脉络对比。

## 相关方向

- [02 多模态目标识别](../02-multimodal-object-recognition/)——视觉语言预训练的方法层面高度重叠，很多动物方向的工作直接迁移自这里。CLIP 作为这一脉的源头，收录在 02 方向。
- 视频动作识别的通用方法（SlowFast、TimeSformer、VideoMamba 等）虽然不专门针对动物，但本方向大量使用，仍收录在本方向的 `papers/` 中。
