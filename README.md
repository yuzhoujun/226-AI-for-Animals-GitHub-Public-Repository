# 动物行为理解与视频动作识别资料库

本仓库汇集了动物行为理解（Animal Behavior Understanding）与视频动作识别（Video Action Recognition）方向的代表性研究资料，便于进行选题调研、方法对比和后续方案设计。

## 研究主题

资料覆盖以下相关方向：

- 动物行为识别与细粒度行为理解
- 野外动物姿态估计与关键点检测
- 长时序视频建模与动作识别
- 视频时空表征学习
- 多模态视觉语言预训练

## 目录说明

```text
.
├── 数据集/       # 动物行为、动物姿态等公开数据集论文
├── 算法/         # 视频理解与动作识别模型论文
├── 综述/         # 动物行为分析、动作理解方向综述
└── 创新点/       # 项目创新思路、待补充的方案材料
```

## 内容索引

### 数据集

| 资料 | 关注点 |
| --- | --- |
| AP-10K | 野外动物姿态估计基准 |
| Animal Kingdom | 大规模、多样化动物行为数据集 |
| LoTE-Animal | 濒危动物的长时间跨度行为理解 |

### 算法

| 类别 | 代表资料 |
| --- | --- |
| 3D 卷积与双路径网络 | C3D、SlowFast |
| Transformer 视频建模 | TimeSformer、Swin Transformer、MViT、UniFormer |
| 时序特征建模 | Temporal Pyramid Network |
| 状态空间模型 | VideoMamba |
| 视觉语言与动作识别 | CLIP、ActionCLIP |

### 综述

- `Animal behavior analysis methods using deep learning: A survey`
- `A Survey of Video Action Recognition Based on Deep Learning`
- `About Time: Advances, Challenges, and Outlooks of Action Understanding`

## 建议阅读路径

1. 先阅读 `综述/`，建立动物行为分析与视频动作理解的整体认识。
2. 结合 `数据集/` 明确任务定义、标注形式和评测设置。
3. 在 `算法/` 中对比 3D CNN、Transformer、状态空间模型及视觉语言模型的特点。
4. 将可行思路和实验设计沉淀到 `创新点/`，逐步形成研究方案。

## 使用说明

本仓库目前以论文资料整理为主，不包含可直接运行的训练或推理代码。引用、复现或使用各项工作时，请遵循原论文、数据集和代码仓库所附的许可与使用条款。

## 贡献

欢迎补充相关论文、数据集、开源实现、阅读笔记和实验方案。建议按现有目录分类存放，并在提交说明中标明新增内容的来源与用途。
