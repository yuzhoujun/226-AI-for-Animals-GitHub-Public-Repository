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

## 本任务收录

<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
共 7 篇。

| 年份 | 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- | --- |
| [2024](2024.md) | [DETRs Beat YOLOs on Real-time Object Detection](https://arxiv.org/abs/2304.08069) | CVPR 2024 | [代码](https://github.com/lyuwenyu/RT-DETR) | 第一个实时 DETR，用高效混合编码器与 IoU 感知查询选择去掉 NMS 开销，在速度-精度曲线上超过同量级 YOLO。 |
| [2024](2024.md) | [Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection](https://arxiv.org/abs/2303.05499) | ECCV 2024 | [代码](https://github.com/IDEA-Research/GroundingDINO) | 把文本提示接入 DINO 的检测流程，用自然语言指定类别即可检测任意目标，是开放词汇检测与「检测一切」一脉的关键一环。 |
| [2023](2023.md) | [DINO: DETR with Improved DeNoising Anchor Boxes for End-to-End Object Detection](https://arxiv.org/abs/2203.03605) | ICLR 2023 | [代码](https://github.com/IDEA-Research/DINO) | 引入对比去噪训练与混合查询选择，是 DETR 一脉首个在 COCO 上明显超过同量级 Faster R-CNN 的工作，也是后续 Grounding DINO 的检测头基座。 |
| [2023](2023.md) | [DETRs with Collaborative Hybrid Assignments Training](https://arxiv.org/abs/2211.12860) | ICCV 2023 | [代码](https://github.com/Sense-X/Co-DETR) | 指出 DETR 的一对一匹配监督过于稀疏，用一对多标签分配协同训练来补足解码器监督，在多个 DETR 变体上一致涨点。 |
| [2021](2021.md) | [Deformable DETR: Deformable Transformers for End-to-End Object Detection](https://arxiv.org/abs/2010.04159) | ICLR 2021 Oral | [代码](https://github.com/fundamentalvision/Deformable-DETR) | 用可变形注意力只在参考点周围采样少量位置，把 DETR 的收敛轮数降低一个量级，同时改善小目标检测。 |
| [2020](2020.md) | [End-to-End Object Detection with Transformers](https://arxiv.org/abs/2005.12872) | ECCV 2020 | [代码](https://github.com/facebookresearch/detr) | 用 Transformer 编码器-解码器配合二分图匹配损失，把检测改写为集合预测问题，去掉了 anchor 与非极大值抑制这两个手工组件。 |
| [2017](2017.md) | [Mask R-CNN](https://arxiv.org/abs/1703.06870) | ICCV 2017 | [代码](https://github.com/facebookresearch/Detectron) | 在 Faster R-CNN 上并联一条掩码预测分支，把检测与实例分割统一进同一个框架，成为此后实例分割的标准基线。 |
<!-- AUTO:INDEX:END -->

## 与本方向其他任务的关系

- 检测框是多目标跟踪（`multi-object-tracking`，待建）的输入，两者通常串起来用。
- [分割](../segmentation/) 里 SAM 一脉的提示式分割，常与本文的开放词汇检测配合做「检测 + 分割」的标注流水线。
