# 数据集

按**数据集发布年份**分文件：`2026.md`、`2025.md`……年份由文件名体现，表格里不再重复一列。

新建年份文件时，直接复制 [`templates/datasets-year.md`](../../../templates/datasets-year.md)。

「规模」和「获取方式」比名称重要——让人一眼判断**够不够用、拿不拿得到**。
License 一栏从官方页面照抄，不要自己推断；找不到就写「未明确」。

> ⚠️ 只记录**官方获取入口**。不要转存数据本体，也不要把需要申请才能拿到的数据挂到公开网盘。

## 本方向收录

<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
共 13 个。

| 年份 | 数据集 | 规模 | 获取方式 | License |
| --- | --- | --- | --- | --- |
| [2026](2026.md) | [MammalMotion](https://motion-forecasting.github.io/) | 项目页描述为超过 300 小时野外动物视频；正式发布后应以数据集页面最终统计为准。 | [获取入口](https://motion-forecasting.github.io/)，未公开（仅论文描述） | 未明确 |
| [2025](2025.md) | [MammAlps](https://arxiv.org/abs/2503.18223) | 瑞士国家公园 9 台红外相机 / 14 小时以上带音频视频 / 8.5 小时逐个体轨迹标注 / 6,135 段单动物片段，含物种与行为标签 | [官方仓库](https://github.com/eceo-epfl/MammAlps) | 见官方仓库 |
| [2024](2024.md) | [PanAf20K](https://arxiv.org/abs/2401.13554) | 约 20,000 段红外相机视频 / 超 700 万帧 / 非洲多国野外站点（arXiv 版 14 个，IJCV 正式版 18 个）/ 黑猩猩与山地大猩猩的检测与行为标注 | 见论文页面 | 见论文页面 |
| [2024](2024.md) | [WildlifeReID-10k](https://arxiv.org/abs/2406.09211) | 10,000+ 个个体 / 约 33 个物种 / 140,000+ 张图（从 37 个已有数据集重采样）/ 含时间与相似度感知的划分协议 | 见论文页面的 Kaggle 入口，公开下载 | 见 Kaggle 页面 |
| [2024](2024.md) | [Multispecies Animal Re-ID](https://arxiv.org/abs/2412.05602) | 49 个物种 / 37,000 个个体 / 225,000 张图 / 面向「一个模型识别所有物种」的多物种评测 | 见论文页面 | 见论文页面 |
| [2023](2023.md) | [LoTE-Animal](https://lote-animal.github.io/) | 12 年红外相机连续采集 / 约 50 万段视频 / 面向濒危动物长时序行为理解 | [项目页](https://lote-animal.github.io/)下载 | 见官方页面 |
| [2023](2023.md) | [APTv2](https://arxiv.org/abs/2312.15612) | 2,749 段视频 / 30 个物种 / 每段 15 帧，共 41,235 帧 / 姿态估计 + 多目标跟踪联合标注 | 见论文页面 | 见论文页面 |
| [2023](2023.md) | [Animal3D](https://arxiv.org/abs/2308.11737) | 3,379 张图 / 40 个哺乳动物物种 / 26 个关键点 + SMAL 模型的三维姿态与形状参数 | [项目页](https://xujiacong.github.io/Animal3D/) | 见官方页面 |
| [2023](2023.md) | [ChimpACT](https://arxiv.org/abs/2310.16447) | 163 段视频 / 160,500 帧 / 德国莱比锡动物园 20 余只黑猩猩，2015–2018 纵向追踪 / 个体身份 + 行为标注 | 见论文页面 | 见论文页面 |
| [2023](2023.md) | [WildlifeDatasets](https://arxiv.org/abs/2311.09118) | 开源工具包，统一接入多个野生动物重识别数据集 / 附带跨物种基础模型 MegaDescriptor | [官方仓库](https://github.com/WildlifeDatasets/wildlife-datasets)，pip 安装 | 见官方仓库 |
| [2022](2022.md) | [Animal Kingdom](https://arxiv.org/abs/2204.08129) | 850 个物种 / 多任务标注（动作识别 + 姿态估计 + 时序定位） | [官方仓库](https://github.com/sutdcv/Animal-Kingdom) | 见官方仓库 |
| [2022](2022.md) | [APT-36K](https://arxiv.org/abs/2206.05683) | 36,000 帧 / 30 个物种 / 关键点标注 + 个体跟踪框，可用于姿态估计与跟踪联合评测 | [官方仓库](https://github.com/pandorgan/APT-36K) | 见官方仓库 |
| [2021](2021.md) | [AP-10K](https://arxiv.org/abs/2108.12617) | 10,015 张图 / 23 科 54 种哺乳动物 / 23,000+ 关键点实例 | [官方仓库](https://github.com/AlexTheBad/AP-10K)，直接下载 | 见官方仓库 |
<!-- AUTO:INDEX:END -->

完整规范见 [CONTRIBUTING.md](../../../CONTRIBUTING.md#加一个数据集)。
