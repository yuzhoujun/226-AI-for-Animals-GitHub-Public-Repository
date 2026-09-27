# 可迁移基础方法

**研究对象是通用场景**，但方法或数据集可以迁移到动物任务上的工作。

本方向是 [01-ai-for-animals](../01-ai-for-animals/) 的技术底座。之所以单独拆出来，是因为这类论文本身不以动物为研究对象，混在动物方向里会让「这个方向在研究什么」变得模糊。

> 📌 **收录判定**：看论文的**主实验跑在什么数据集上**。用 COCO / ImageNet / Kinetics / MOT17 等通用基准的 → 收在这里。
> 用动物数据集的 → 收到隔壁 [01-ai-for-animals](../01-ai-for-animals/)。
>
> 两边都做的（比如通用检测器在动物数据集上评测）：**看主实验在哪边**，在主方向收录一份，另一边的 README 里提一句即可，不要重复收录。

## 任务分类

每个任务一个子目录，放在 `papers/` 下。**目录有内容了才创建**，不要预先建空目录。

| 任务 | 目录名 | 说明 | 状态 |
| --- | --- | --- | --- |
| 动作与行为识别 | `action-recognition` | 视频动作分类、时序建模 | [有内容](papers/action-recognition/) |
| 视觉-语言与多模态 | `vision-language` | CLIP 一脉、开放词汇、跨模态对齐 | [有内容](papers/vision-language/) |
| 目标检测 | `object-detection` | 含小目标、密集、开放词汇 | [有内容](papers/object-detection/) |
| 图像分割 | `segmentation` | 含 SAM 一脉的开放词汇分割 | [有内容](papers/segmentation/) |
| 世界模型 | `world-models` | 隐空间动态建模，对应行为预测 | [有内容](papers/world-models/) |
| 图像拼接 | `image-stitching` | 配准、特征匹配、全景拼接 | [待补充](papers/image-stitching/) |
| 多目标跟踪 | `multi-object-tracking` | MOT / 视频跟踪 | 待建 |
| 重识别 | `re-identification` | 通用 Re-ID 方法（行人等） | 待建 |
| 姿态估计 | `pose-estimation` | 通用人体/物体姿态 | 待建 |
| 小样本、长尾与自监督 | `few-shot-long-tail` | 直接对应动物数据标注贵的问题 | 待建 |
| 生成式数据增强 | `generative-augmentation` | 用扩散模型造稀缺物种样本 | 待建 |

**关键词**：action recognition, video understanding, vision-language pretraining, open-vocabulary detection, object detection, multi-object tracking, re-identification, pose estimation, segmentation, self-supervised learning, world models

## 已收录内容

| 任务 | 论文 | 综述 |
| --- | --- | --- |
| 动作与行为识别 | [2015](papers/action-recognition/2015.md) · [2019](papers/action-recognition/2019.md) · [2020](papers/action-recognition/2020.md) · [2021](papers/action-recognition/2021.md) · [2022](papers/action-recognition/2022.md) · [2024](papers/action-recognition/2024.md) | [2025](surveys/2025.md) |
| 视觉-语言与多模态 | [2021](papers/vision-language/2021.md) · [2023](papers/vision-language/2023.md) | — |
| 目标检测 | [2017](papers/object-detection/2017.md) · [2020](papers/object-detection/2020.md) · [2021](papers/object-detection/2021.md) · [2023](papers/object-detection/2023.md) · [2024](papers/object-detection/2024.md) | — |
| 图像分割 | [2015](papers/segmentation/2015.md) · [2021](papers/segmentation/2021.md) · [2022](papers/segmentation/2022.md) · [2023](papers/segmentation/2023.md) · [2024](papers/segmentation/2024.md) | — |
| 世界模型 | [2018](papers/world-models/2018.md) · [2024](papers/world-models/2024.md) · [2025](papers/world-models/2025.md) · [2026](papers/world-models/2026.md) | — |
| 图像拼接 | — | — |

## 建议阅读顺序

**动作与行为识别**——按技术脉络读，这条线最完整：

1. C3D（2015）确立 3D 卷积做时空特征的基本范式
2. SlowFast（2019）、TPN（2020）分别在双路径设计和时序尺度上做改进
3. Transformer 一脉（2021–2022）：TimeSformer、Swin、MViT、UniFormer
4. 状态空间模型（2024）：VideoMamba，用线性复杂度替代注意力的二次复杂度
5. 综述（2025）收口，看整体脉络和当前瓶颈

**视觉-语言与多模态**——从 CLIP（2021）读起，它是后续绝大多数工作的基座；再看这些模型怎么被用到视频/动作任务上。

**目标检测**——从 Mask R-CNN（2017）建立两阶段范式的直觉，到 DETR（2020）的范式转折，
再到 Deformable DETR（2021）、DINO（2023）让它真正好用。**要部署看 RT-DETR，要开放词汇看 Grounding DINO。**

**图像分割**——U-Net（2015）打底 → SegFormer / Mask2Former（2021–2022）看 Transformer 怎么进来 →
SAM 一脉（2023–2024）看「提示式分割」这个新交互范式。**动物方向读这条线主要是为了降标注成本。**

**世界模型**——这条线在动物领域还没有直接应用，收进来是为了**行为预测**这个方向占位：
它不需要行为类别标签，只需要连续视频，恰好匹配红外相机的数据形态。入门读 World Models（2018）和 V-JEPA 2（2025）。

**图像拼接**——见 [该任务的说明](papers/image-stitching/README.md)。

## 相关方向

- [01-ai-for-animals](../01-ai-for-animals/)——本方向方法的主要应用场景。
