# AI+动物

**研究对象是动物**的计算机视觉与多模态工作：行为理解、姿态估计、个体识别、种群调查等。

> 📌 **收录判定**：看论文的**主实验跑在什么数据集上**。用动物数据集（Animal Kingdom、AP-10K、LoTE-Animal…）→ 收在这里。
> 用 COCO / ImageNet / Kinetics / MOT17 等通用基准的 → 收到隔壁 [02-foundations](../02-foundations/)。
>
> 这条规则是为了避免「这篇算不算动物相关」的扯皮。拿不准就按数据集判断。

## 任务分类

每个任务一个子目录，放在 `papers/` 下。**目录有内容了才创建**，不要预先建空目录。

| 任务 | 目录名 | 说明 | 状态 |
| --- | --- | --- | --- |
| 行为识别与理解 | `behavior` | 细粒度行为、长时序行为分析，本方向的核心 | 待建 |
| 姿态估计 | `pose-estimation` | 关键点检测、野外姿态 | 待建 |
| 个体重识别 | `re-identification` | 动物个体 ID，区别于通用行人 Re-ID | 待建 |
| 检测、计数与种群调查 | `detection-counting` | 红外相机触发、野生动物普查 | 待建 |
| 多目标跟踪 | `tracking` | 动物轨迹、群体移动 | 待建 |
| 面部与个体识别 | `face-identification` | 区别于全身 Re-ID 的一条独立线 | 待建 |
| 声学与多模态 | `bioacoustics` | 鸟鸣/鲸歌识别，音视频融合 | 待建 |
| 群体行为与社会交互 | `collective-behavior` | 个体间交互建模 | 待建 |
| 跨物种泛化与域适应 | `cross-species` | 标注稀缺、物种长尾 | 待建 |

**关键词**：animal behavior understanding, animal pose estimation, animal re-identification, wildlife monitoring, fine-grained action recognition, camera trap, bioacoustics

## 已收录内容

| 类型 | 年份 | 内容 |
| --- | --- | --- |
| 综述 | 2025 | [1 篇](surveys/2025.md) — 动物行为分析深度学习方法综述 |
| 数据集 | 2021 | [1 个](datasets/2021.md) — AP-10K |
| 数据集 | 2022 | [1 个](datasets/2022.md) — Animal Kingdom |
| 数据集 | 2023 | [1 个](datasets/2023.md) — LoTE-Animal |

> ⚠️ **本方向目前还没有动物专属的论文。** 之前的 C3D、SlowFast、TimeSformer、VideoMamba、CLIP、BIKE 等
> 都是通用方法，已按上面的判定规则移到 [02-foundations](../02-foundations/)。这是符合预期的起点，
> 不是遗漏——动物方向的论文需要后续专门补充。

## 建议阅读顺序

1. 先读 [surveys/2025.md](surveys/2025.md) 那篇动物行为分析综述，建立「这个方向在解决什么问题」的整体认识。
2. 再看 [datasets/](datasets/)，明确任务定义、标注形式和评测指标——**动物方向的难点往往在数据而不在模型**。
3. 方法层面去 [02-foundations](../02-foundations/) 看：动物方向目前大量复用通用视频理解与视觉语言模型的技术栈，
   按 3D CNN → Transformer → 状态空间模型 → 视觉语言模型这条脉络读。

## 相关方向

- [02-foundations](../02-foundations/)——可迁移的通用方法与数据集。本方向的模型骨干基本都来自那里。
