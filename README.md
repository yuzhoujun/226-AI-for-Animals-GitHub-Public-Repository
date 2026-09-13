# 教研室文献资料库

教研室各研究方向的公开文献索引。按**研究方向**归类，按**年份**归档，**只存链接不存 PDF**。

本仓库只做一件事：让你在选题、调研、写开题报告时，能快速找到一个方向上有哪些代表性工作、它们分别解决什么问题、代码在哪里。

## 三条约定

1. **按方向分**——每个研究方向一个独立目录，互不干扰，后续可继续增加新方向。
2. **按年份分**——论文、综述、数据集都按年份建文件（如 `2026.md`），新内容追加到对应年份。
3. **只存链接**——不提交 PDF 全文，只记录标题 + 官方链接 + 代码仓库。既避免版权问题，也保证大家拿到的永远是最新版。

## 目录结构

```text
.
├── README.md                  # 本文件：仓库总览与方向索引
├── CONTRIBUTING.md            # 添加内容的完整步骤（新同学先看这个）
├── templates/                 # 填写模板，复制后用
│   ├── papers-year.md         #   年度论文清单
│   ├── surveys-year.md        #   年度综述清单
│   └── datasets-year.md       #   年度数据集清单
├── directions/                # 各研究方向
│   ├── README.md              #   方向总索引
│   ├── 01-ai-for-animals/
│   ├── 02-multimodal-object-recognition/
│   ├── 03-remote-sensing/
│   └── 04-image-stitching/
└── .github/                   # 协作自动化（PR/Issue 模板、链接检查）
```

每个方向目录的内部结构完全一致：

```text
01-ai-for-animals/
├── README.md      # 方向简介：研究范围、关键词、年度速览
├── papers/        # 研究论文，按年份分文件：2026.md、2025.md ...
├── surveys/       # 综述，同样按年份分文件
└── datasets/      # 数据集，按发布年份分文件
```

## 研究方向

| 方向 | 关注点 | 论文 | 综述 | 数据集 |
| --- | --- | --- | --- | --- |
| [AI+动物](directions/01-ai-for-animals/) | 动物行为理解、姿态估计、视频动作识别 | [论文](directions/01-ai-for-animals/papers/) | [综述](directions/01-ai-for-animals/surveys/) | [数据集](directions/01-ai-for-animals/datasets/) |
| [多模态目标识别](directions/02-multimodal-object-recognition/) | 视觉-语言预训练、开放词汇检测、跨模态对齐 | [论文](directions/02-multimodal-object-recognition/papers/) | [综述](directions/02-multimodal-object-recognition/surveys/) | [数据集](directions/02-multimodal-object-recognition/datasets/) |
| [遥感图像识别](directions/03-remote-sensing/) | 遥感场景分类、目标检测、语义分割、变化检测 | [论文](directions/03-remote-sensing/papers/) | [综述](directions/03-remote-sensing/surveys/) | [数据集](directions/03-remote-sensing/datasets/) |
| [图像拼接](directions/04-image-stitching/) | 图像配准、特征匹配、全景拼接、视频拼接 | [论文](directions/04-image-stitching/papers/) | [综述](directions/04-image-stitching/surveys/) | [数据集](directions/04-image-stitching/datasets/) |

## 怎么找资料

- **刚入门一个方向**：先读该方向 `surveys/` 里最近两年的综述，建立整体认识。
- **要跟最新进展**：直接看 `papers/` 里当年和前一年的文件。
- **要找数据做实验**：看 `datasets/`，每条都标注了规模、获取方式和 License。
- **要复现代码**：论文表格的「代码」列直接给仓库地址。

## 我要添加内容

完整步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。最省事的方式是直接在 GitHub 网页上编辑——不需要会 git，浏览器里点几下就能提交，会自动生成一个 Pull Request 等维护者审核。

## 使用与版权

- 本仓库**不存放论文 PDF 全文**。所有条目只提供指向 arXiv、出版社 DOI 或官方项目页的链接。
- 数据集条目只提供官方获取入口，不转存数据本体。使用前请自行确认各数据集的 License 和使用条款。
- 引用本仓库收录的工作时，请引用原始论文。
