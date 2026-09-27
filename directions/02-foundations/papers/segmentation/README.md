# 图像分割

通用图像分割方法。收录判定见 [方向说明](../../README.md)——主实验跑在 COCO、ADE20K 等通用基准上的收在这里。

**为什么动物方向要读这条线**：动物研究里最贵的一环是标注。SAM 一脉的提示式分割让「点几下就得到掩码」
成为可能，是把标注成本从小时级压到分钟级的关键工具；实例分割则直接支撑个体计数与形态测量。

## 建议阅读顺序

1. **U-Net（2015）**——编码器-解码器 + 跳连，先建立分割网络的基本结构直觉。
2. **SegFormer（2021）/ Mask2Former（2022）**——Transformer 进入分割的两条路径：前者图省事，后者图统一。
   Mask2Former 的「掩码注意力」是理解现代分割架构的关键。
3. **SAM（2023）**——范式转折点。重点不是精度，而是「提示式 + 零样本」这个新交互方式。
4. **HQ-SAM（2023）**——SAM 的边缘质量在科研场景经常不够用，这篇是直接对症的改进。
5. **SAM 2（2024）**——要处理视频/序列数据（红外相机连续触发）时看这篇。

## 年份索引

<!-- AUTO:YEARS:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
| 年份 | 文件 |
| --- | --- |
| 2024 | [1 篇](2024.md) — SAM 2: Segment Anything in Images and Videos |
| 2023 | [2 篇](2023.md) — Segment Anything、Segment Anything in High Quality |
| 2022 | [1 篇](2022.md) — Masked-attention Mask Transformer for Universal Image Segmentation |
| 2021 | [1 篇](2021.md) — SegFormer: Simple and Efficient Design for Semantic Segmentation with Transformers |
| 2015 | [1 篇](2015.md) — U-Net: Convolutional Networks for Biomedical Image Segmentation |
<!-- AUTO:YEARS:END -->

## 与本方向其他任务的关系

- 与 [目标检测](../object-detection/) 的 Grounding DINO 组合，是当前「开放词汇检测 + 分割」标注流水线的常见搭法。
- 姿态估计（`pose-estimation`，待建）中的动物姿态工作大量依赖分割掩码来分离个体。
