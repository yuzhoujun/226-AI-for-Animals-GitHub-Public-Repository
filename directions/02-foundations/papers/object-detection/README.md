# 目标检测

通用目标检测方法。收录判定见 [方向说明](../../README.md)——主实验跑在 COCO 等通用基准上的收在这里。

**为什么动物方向要读这条线**：红外相机触发、野生动物普查、个体计数，本质上都是检测任务；
而动物检测的特殊困难（伪装色、遮挡、密集群体、物种长尾）恰好对应这条线上小目标、开放词汇、长尾几个分支。

## 建议阅读顺序

1. **Mask R-CNN（2017）**——两阶段检测 + 掩码分支，理解「区域提议 → 分类回归」这套范式的起点。
2. **DETR（2020）**——范式转折点。看懂它怎么用集合预测替掉 anchor 和 NMS。
3. **Deformable DETR（2021）**——解决 DETR 收敛慢、小目标差的痛点，是 DETR 真正变得好用的那一步。
4. **DINO（2023）与 Co-DETR（2023）**——两条不同的改进路线：前者改训练策略（去噪 + 查询选择），后者改标签分配。
5. **RT-DETR（2024）**——实时化。如果要在野外设备上部署，从这篇看起。
6. **Grounding DINO（2024）**——开放词汇。如果物种清单会变、标注类别不全，这条线更合适。

## 年份索引

<!-- AUTO:YEARS:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
| 年份 | 文件 |
| --- | --- |
| 2024 | [2 篇](2024.md) — DETRs Beat YOLOs on Real-time Object Detection、Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection |
| 2023 | [2 篇](2023.md) — DINO: DETR with Improved DeNoising Anchor Boxes for End-to-End Object Detection、DETRs with Collaborative Hybrid Assignments Training |
| 2021 | [1 篇](2021.md) — Deformable DETR: Deformable Transformers for End-to-End Object Detection |
| 2020 | [1 篇](2020.md) — End-to-End Object Detection with Transformers |
| 2017 | [1 篇](2017.md) — Mask R-CNN |
<!-- AUTO:YEARS:END -->

## 与本方向其他任务的关系

- 检测框是多目标跟踪（`multi-object-tracking`，待建）的输入，两者通常串起来用。
- [分割](../segmentation/) 里 SAM 一脉的提示式分割，常与本文的开放词汇检测配合做「检测 + 分割」的标注流水线。
