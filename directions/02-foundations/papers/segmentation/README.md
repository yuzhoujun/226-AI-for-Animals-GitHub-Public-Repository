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

## 本任务收录

<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
共 6 篇。

| 年份 | 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- | --- |
| [2024](2024.md) | [SAM 2: Segment Anything in Images and Videos](https://arxiv.org/abs/2408.00714) | ICLR 2025 | [代码](https://github.com/facebookresearch/sam2) | 把可提示分割扩展到视频，用记忆机制跨帧传播掩码，实现视频中任意目标的零样本跟踪式分割。 |
| [2023](2023.md) | [Segment Anything](https://arxiv.org/abs/2304.02643) | ICCV 2023 | [代码](https://github.com/facebookresearch/segment-anything) | 构建了十亿掩码级别的分割数据集并训练出可提示的分割基础模型，用点、框或文本提示即可零样本分割任意物体。 |
| [2023](2023.md) | [Segment Anything in High Quality](https://arxiv.org/abs/2306.01567) | NeurIPS 2023 | [代码](https://github.com/SysCV/sam-hq) | 指出 SAM 在细粒度边缘上质量不足，通过高质量掩码先验与轻量适配把输出精度提升到可用的细节级别。 |
| [2022](2022.md) | [Masked-attention Mask Transformer for Universal Image Segmentation](https://arxiv.org/abs/2112.01527) | CVPR 2022 | [代码](https://github.com/facebookresearch/Mask2Former) | 用掩码注意力约束交叉注意力只落在预测掩码内部，让同一套架构统一处理语义、实例与全景分割三类任务。 |
| [2021](2021.md) | [SegFormer: Simple and Efficient Design for Semantic Segmentation with Transformers](https://arxiv.org/abs/2105.15203) | NeurIPS 2021 | [代码](https://github.com/NVlabs/SegFormer) | 用无位置编码的分层 Transformer 编码器配极轻量的 MLP 解码器，结构简单但在多尺度分割上兼顾了精度与速度。 |
| [2015](2015.md) | [U-Net: Convolutional Networks for Biomedical Image Segmentation](https://arxiv.org/abs/1505.04597) | MICCAI 2015 | [第三方实现](https://github.com/milesial/Pytorch-UNet) | 提出对称的编码器-解码器结构并用跳连把浅层细节直接送到解码端，在小样本医学图像上取得很好效果，成为语义分割最通用的骨干结构。 |
<!-- AUTO:INDEX:END -->

## 与本方向其他任务的关系

- 与 [目标检测](../object-detection/) 的 Grounding DINO 组合，是当前「开放词汇检测 + 分割」标注流水线的常见搭法。
- 姿态估计（`pose-estimation`，待建）中的动物姿态工作大量依赖分割掩码来分离个体。
