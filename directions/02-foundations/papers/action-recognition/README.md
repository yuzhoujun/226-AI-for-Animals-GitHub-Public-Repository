# 动作与行为识别

视频动作分类与时序建模。这是 [01-ai-for-animals](../../../01-ai-for-animals/) 里动物行为识别任务的技术底座。

按**发表年份**分文件：`2026.md`、`2025.md`……

## 本任务收录

<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
共 11 篇。

| 年份 | 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- | --- |
| [2025](2025.md) | [Feature Hallucination for Self-supervised Action Recognition](https://arxiv.org/abs/2506.20342) | IJCV 2025 | — | 在只有 RGB 输入时预测动作概念及缺失的检测、显著性、光流、骨架或音频等辅助线索，并利用不确定性提升动作识别鲁棒性。 |
| [2024](2024.md) | [VideoMamba: State Space Model for Efficient Video Understanding](https://arxiv.org/abs/2403.06977) | ECCV 2024 | [代码](https://github.com/OpenGVLab/VideoMamba) | 把 Mamba 状态空间模型引入视频，以线性复杂度做长时建模，同时兼顾短期动作敏感性与多模态兼容。 |
| [2024](2024.md) | [VideoMamba: Spatio-Temporal Selective State Space Model](https://doi.org/10.1007/978-3-031-72698-9_1) | ECCV 2024 | — | 提出时空前向/后向 SSM 的纯 Mamba 视频识别模型，以线性复杂度捕获视频的长程依赖。 |
| [2022](2022.md) | [UniFormer: Unified Transformer for Efficient Spatiotemporal Representation Learning](https://arxiv.org/abs/2201.04676) | ICLR 2022 | [代码](https://github.com/Sense-X/UniFormer) | 在统一 Transformer 中融合 3D 卷积与时空自注意力，浅层做局部、深层做全局，兼顾效率与精度。 |
| [2021](2021.md) | [Multiscale Vision Transformers](https://arxiv.org/abs/2104.11227) | ICCV 2021 | [代码](https://github.com/facebookresearch/SlowFast) | 提出多尺度视觉 Transformer 与池化注意力，分层扩展通道的同时降低分辨率，统一视频与图像识别。代码在 SlowFast 仓库的 projects/mvit 目录下。 |
| [2021](2021.md) | [Swin Transformer: Hierarchical Vision Transformer using Shifted Windows](https://arxiv.org/abs/2103.14030) | ICCV 2021 | [代码](https://github.com/microsoft/Swin-Transformer) | 提出移位窗口的分层视觉 Transformer 骨干，计算复杂度随图像尺寸线性增长，刷新分类、检测、分割多项 SOTA。 |
| [2021](2021.md) | [Is Space-Time Attention All You Need for Video Understanding?](https://arxiv.org/abs/2102.05095) | ICML 2021 | [代码](https://github.com/facebookresearch/TimeSformer) | 提出纯自注意力的视频分类架构，用时空分离注意力降低计算量，训练更快且能处理更长的视频片段。 |
| [2020](2020.md) | [Temporal Pyramid Network for Action Recognition](https://arxiv.org/abs/2004.03548) | CVPR 2020 | [代码](https://github.com/decisionforce/TPN) | 提出特征层面的时序金字塔网络，可插拔地建模不同视觉节奏，在 Kinetics 上稳定涨点约 2%。 |
| [2019](2019.md) | [SlowFast Networks for Video Recognition](https://arxiv.org/abs/1812.03982) | ICCV 2019 | [代码](https://github.com/facebookresearch/SlowFast) | 提出慢快双路径网络，慢路径建模空间语义、快路径抓细粒度运动，在多个视频基准上达到 SOTA。 |
| [2015](2015.md) | [Learning Spatiotemporal Features with 3D Convolutional Networks](https://arxiv.org/abs/1412.0767) | ICCV 2015 | [代码](https://github.com/facebookarchive/C3D) | 提出统一用 3×3×3 小卷积核的 3D 卷积网络学习时空特征，证明 3D 卷积优于 2D，并开源预训练模型。 |
<!-- AUTO:INDEX:END -->

技术脉络见 [方向 README](../../README.md#建议阅读顺序)。

新建年份文件时，直接复制 [`templates/papers-year.md`](../../../../templates/papers-year.md)。
