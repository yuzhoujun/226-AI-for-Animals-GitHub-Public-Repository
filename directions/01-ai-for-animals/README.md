# AI+动物

**研究对象是动物**的计算机视觉与多模态工作：行为理解、姿态估计、个体识别、种群调查等。

> 📌 **收录判定**：看论文的**主实验跑在什么数据集上**。用动物数据集（Animal Kingdom、AP-10K、LoTE-Animal…）→ 收在这里。
> 用 COCO / ImageNet / Kinetics / MOT17 等通用基准的 → 收到隔壁 [02-foundations](../02-foundations/)。
>
> 这条规则是为了避免「这篇算不算动物相关」的扯皮。拿不准就按数据集判断。
>
> 📌 **数据集与方法可以双收**：一篇工作如果**既发布了数据集、又提出了具体的方法模型**，
> `datasets/` 和 `papers/<任务>/` 各收一条，两条互相链一下即可。
> 只有数据集、没有方法贡献的（纯 benchmark），只收 `datasets/`。
> 目前双收的有：WildlifeDatasets（数据集在 [datasets/2023](datasets/2023.md)，方法 MegaDescriptor 在 [re-identification/2024](papers/re-identification/2024.md)）。
> 两边年份不一样是正常的——**数据集按发布年归档，论文按正式发表年归档**（这篇 arXiv 2023、WACV 2024）。

## 任务分类

每个任务一个子目录，放在 `papers/` 下。**目录有内容了才创建**，不要预先建空目录。

| 任务 | 目录名 | 说明 | 状态 |
| --- | --- | --- | --- |
| 行为识别与理解 | `behavior` | 细粒度行为、长时序行为分析，本方向的核心 | [6 篇](papers/behavior/) |
| 姿态估计 | `pose-estimation` | 关键点检测、野外姿态 | [6 篇](papers/pose-estimation/) |
| 个体重识别 | `re-identification` | 动物个体 ID，区别于通用行人 Re-ID | [5 篇](papers/re-identification/) |
| 检测、计数与种群调查 | `detection-counting` | 红外相机触发、野生动物普查 | 待建 |
| 多目标跟踪 | `tracking` | 动物轨迹、群体移动 | 待建 |
| 面部与个体识别 | `face-identification` | 区别于全身 Re-ID 的一条独立线 | 待建 |
| 声学与多模态 | `bioacoustics` | 鸟鸣/鲸歌识别，音视频融合 | 待建 |
| 群体行为与社会交互 | `collective-behavior` | 个体间交互建模 | 待建 |
| 跨物种泛化与域适应 | `cross-species` | 标注稀缺、物种长尾 | 待建 |

**关键词**：animal behavior understanding, animal pose estimation, animal re-identification, wildlife monitoring, fine-grained action recognition, camera trap, bioacoustics

## 已收录内容

<!-- AUTO:COLLECTION:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
**论文**（17 篇）

| 任务 | 年份 |
| --- | --- |
| [行为识别与理解](papers/behavior/) | [2021](papers/behavior/2021.md) · [2024](papers/behavior/2024.md) · [2025](papers/behavior/2025.md) · [2026](papers/behavior/2026.md) |
| [姿态估计](papers/pose-estimation/) | [2019](papers/pose-estimation/2019.md) · [2023](papers/pose-estimation/2023.md) · [2025](papers/pose-estimation/2025.md) |
| [个体重识别](papers/re-identification/) | [2020](papers/re-identification/2020.md) · [2024](papers/re-identification/2024.md) · [2025](papers/re-identification/2025.md) · [2026](papers/re-identification/2026.md) |

**综述**（4 篇）

| 年份 | 条目 |
| --- | --- |
| 2024 | [1 篇](surveys/2024.md) — Towards Multi-Modal Animal Pose Estimation: A Survey and In-Depth Analysis |
| 2025 | [3 篇](surveys/2025.md) — Animal behavior analysis methods using deep learning: a survey、A Review on Coarse to Fine-Grained Animal Action Recognition、Computer Vision for Primate Behavior Analysis in the Wild |

**数据集**（12 个）

| 年份 | 条目 |
| --- | --- |
| 2021 | [1 个](datasets/2021.md) — AP-10K |
| 2022 | [2 个](datasets/2022.md) — Animal Kingdom、APT-36K |
| 2023 | [5 个](datasets/2023.md) — LoTE-Animal、APTv2、Animal3D、ChimpACT、WildlifeDatasets |
| 2024 | [3 个](datasets/2024.md) — PanAf20K、WildlifeReID-10k、Multispecies Animal Re-ID |
| 2025 | [1 个](datasets/2025.md) — MammAlps |
<!-- AUTO:COLLECTION:END -->

> 📌 **本方向的一个显著特点：数据集论文占比很高。** 上面 12 个数据集里，至少有 5 个同时发表在
> NeurIPS Datasets & Benchmarks（AP-10K、APT-36K）、NeurIPS（ChimpACT）、IJCV（PanAf20K）、CVPR（MammAlps）
> 等正式会议期刊上。这不是分类错误——动物领域最贵的是标注，很多高水平工作本身就是「把数据做出来」。
> 因此找工作时**数据集和论文两边都要看**：数据集页面告诉你「能做什么任务」，论文页面告诉你「别人怎么做」。

## 建议阅读顺序

1. 先读 [surveys/2025.md](surveys/2025.md) 那篇动物行为分析综述，建立「这个方向在解决什么问题」的整体认识。
2. 再看 [datasets/](datasets/)，明确任务定义、标注形式和评测指标——**动物方向的难点往往在数据而不在模型**。
3. 三个任务各挑一篇入门：
   - 行为识别 → [AnimalMotionCLIP（2025）](papers/behavior/2025.md)，看视觉-语言这条路怎么绕开行为标注。
   - 姿态估计 → [AniMer（2025）](papers/pose-estimation/2025.md)，看三维参数化模型这条线。
   - 个体重识别 → [OpenAnimals（2025）](papers/re-identification/2025.md)，看「为什么行人 Re-ID 那套不够用」。
4. 方法层面去 [02-foundations](../02-foundations/) 看：本方向的模型骨干基本都来自那里，
   按 3D CNN → Transformer → 状态空间模型 → 视觉语言模型这条脉络读。

## 相关方向

- [02-foundations](../02-foundations/)——可迁移的通用方法与数据集。本方向的模型骨干基本都来自那里。
