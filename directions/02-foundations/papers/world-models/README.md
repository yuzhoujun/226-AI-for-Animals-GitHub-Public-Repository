# 世界模型

在隐空间里学习环境的动态规律，从而做预测与规划的一类方法。收录判定见 [方向说明](../../README.md)。

> ⚠️ **这是本仓库里离动物应用最远的一条线**，收进来是因为它对**行为预测**有直接的方法论价值：
> 动物行为研究的终极问题之一就是「接下来它会做什么」。世界模型提供的正是「从历史观测预测未来状态」
> 这套建模范式，比逐帧分类的行为识别更进一步。目前动物领域的相关工作还很少，属于**值得提前占位**的方向。

## 与行为识别的区别

| | 行为识别 | 世界模型 |
| --- | --- | --- |
| 输出 | 这段视频是哪个行为类别 | 未来若干帧/状态会是什么样 |
| 监督 | 需要行为类别标注 | 可纯自监督，用未来帧当监督信号 |
| 用途 | 统计、分类 | 预测、异常检测、规划 |

**标注稀缺时世界模型这条路更有吸引力**——它不需要行为类别标签，只需要连续视频，而红外相机最不缺的就是连续视频。

## 建议阅读顺序

1. **World Models（2018）**——路线起点，先看它怎么把「压缩 → 预测 → 决策」串起来。
2. **DreamerV3（Nature 2025）**——这条线目前最成熟的工作，重点看它怎么解决跨领域超参不通用的问题。
3. **Genie（2024）**——生成式路线，看世界模型怎么和扩散/自回归生成结合。
4. **V-JEPA 2 / 2.1（2025–2026）**——自监督视频表征路线。**如果只想读一篇，读 V-JEPA 2**：
   它是目前与视觉表征学习结合最紧、最容易迁移到动物视频上的一条。

## 本任务收录

<!-- AUTO:INDEX:BEGIN 由 scripts/gen-index.mjs 生成，请勿手改 -->
共 5 篇。

| 年份 | 标题 | 发表 | 代码 | 一句话贡献 |
| --- | --- | --- | --- | --- |
| [2026](2026.md) | [V-JEPA 2.1: Unlocking Dense Features in Video Self-Supervised Learning](https://arxiv.org/abs/2603.14482) | ECCV 2026 | [代码](https://github.com/facebookresearch/vjepa2) | 针对 V-JEPA 2 的稠密特征质量不足做改进，让自监督视频表征在需要逐像素/逐区域预测的下游任务上更好用。 |
| [2025](2025.md) | [Mastering Diverse Domains through World Models](https://arxiv.org/abs/2301.04104) | Nature 2025 | [代码](https://github.com/danijar/dreamerv3) | DreamerV3 用一套固定超参在跨领域任务上稳定训练出世界模型，无需为每个环境调参，是「世界模型可通用」的重要证据。 |
| [2025](2025.md) | [V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning](https://arxiv.org/abs/2506.09985) | arXiv 2025 | [代码](https://github.com/facebookresearch/vjepa2) | 在大规模视频上自监督预训练后接少量动作数据，使模型具备零样本运动理解与基于预测的机器人规划能力。 |
| [2024](2024.md) | [Genie: Generative Interactive Environments](https://arxiv.org/abs/2402.15391) | ICML 2024 | — | 从无标注的互联网视频里学出一个可交互的生成式环境，仅凭单张图或文本提示就能生成可逐帧操控的虚拟世界。 |
| [2018](2018.md) | [World Models](https://arxiv.org/abs/1803.10122) | NeurIPS 2018 | [代码](https://github.com/hardmaru/WorldModelsExperiments) | 把环境压缩成隐空间、在隐空间里学一个时序预测模型、再在模型内部训练策略，首次完整给出「世界模型」这条技术路线。 |
<!-- AUTO:INDEX:END -->

## 与本方向其他任务的关系

- [动作与行为识别](../action-recognition/)——传统的判别式路线，与世界模型是互补而非替代关系。
- [视觉-语言与多模态](../vision-language/)——V-JEPA 一脉与 CLIP 一脉代表了自监督视频表征的两种取向。
