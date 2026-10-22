# 内容维护指南

内容约束集中在 `src/content.config.ts`。Astro 5 使用 `glob()` 读取 MDX，并在构建时校验 frontmatter。必填字段缺失、分类错误或无效日期会使检查失败，便于发布前定位问题。

## 个人资料

修改 `src/data/profile.ts` 中的姓名、简介、教育背景与求职意向。`github` 为真实个人主页 URL，`email` 为邮箱地址，`resume` 为站内 PDF 路径。准备好资料后再填写可选字段。

上传简历到 `public/resume.pdf` 后，设置 `resume: '/resume.pdf'`。更新文件前检查联系电话、邮箱、项目链接和 PDF 文本可读性。

## 项目

创建 `src/content/projects/my-project.mdx`。以下是待填写模板；替换示例文本并准备对应媒体后再发布：

```mdx
---
title: 我的项目
subtitle: 一句话说明项目形态
description: 用一两句话说明目标、关键机制和当前进度。
track: game
tags: [Godot, C#]
status: development
featured: false
order: 10
cover: /media/my-project/cover.webp
coverAlt: 描述真实截图中的场景与交互
coverKind: screenshot
media:
  - src: /media/my-project/cover.webp
    alt: 描述画面中有助于理解项目的内容
    caption: 画面版本、功能与拍摄背景
relatedPosts: []
---

## 项目概况

写明目标、个人职责、项目阶段与可公开范围。

## 问题与约束

描述具体问题、输入条件和限制。

## 系统架构

说明模块边界、依赖方向与关键数据流。

## 关键实现

选择最能体现工程能力的实现，配合代码或图示。

## 设计权衡

记录候选方案、选择依据和适用范围。

## 技术难点

说明问题如何复现、定位与解决。

## 测试与验证

列出已执行的步骤、环境和结果；计划中的验证另列。

## 项目结果

总结当前产物、剩余问题与下一步。
```

| 字段                 | 取值与用途                                                                    |
| -------------------- | ----------------------------------------------------------------------------- |
| `track`              | `game` 游戏开发；`engine` 引擎与工具；`agent` Agent 与基础设施                |
| `status`             | `prototype` 原型；`development` 开发中；`research` 技术研究；`planned` 待完善 |
| `featured`           | 是否进入精选展示                                                              |
| `order`              | 非负整数，值越小越靠前                                                        |
| `tags`               | 至少一个技术栈标签，用于卡片与筛选                                            |
| `cover` / `coverAlt` | 封面路径及替代文本                                                            |
| `coverKind`          | `concept`（默认，显示概念标注）或 `screenshot`（真实截图）                    |
| `media`              | 至少一张图片，每项包含 `src`、`alt`、`caption`                                |
| `github` / `demo`    | 可选的有效公开 URL；准备好资源后填写                                          |
| `relatedPosts`       | 相关文章的文件 ID，例如 `['state-snapshots']`                                 |

文件名使用稳定的英文短横线标识。重命名时同步修订 `relatedPosts`、正文链接和已分享 URL；需要兼容旧地址时，保留带有新链接的静态跳转页面。

项目列表支持 `track`、`q`、`tag` 与 `sort` 查询参数，排序可选 `featured` 或 `name`。例如 `/projects/?track=game&tag=C%23` 展示游戏方向的 C# 项目；`/projects/?q=Unity&sort=name` 按名称查看搜索结果。

## 博客

创建 `src/content/blog/your-article.mdx`：

```mdx
---
title: 文章标题
description: 说明本文解决的问题与适用场景。
publishedAt: 2026-10-22
tags: [C#, Architecture]
category: 工程设计
---

## 问题背景

先描述工程问题，再逐步展开设计与验证。

## 方案与取舍

给出明确的输入、边界、取舍依据和示例。

## 验证方法

记录读者可以复现的步骤。
```

`updatedAt` 是可选更新时间，建议只在实质修订时更新。`order` 是可选非负整数。日期使用 `YYYY-MM-DD`；首篇正文从 `##` 开始，页面模板负责文章标题。

代码块注明语言，如 `csharp`、`cpp`、`typescript`。MDX 支持导入 Astro 组件，也可以直接编写 HTML。架构图优先使用本地 SVG 或带文字说明的结构图，确保手机上可读。

项目中的 `relatedPosts` 使用文章文件名去掉 `.mdx` 的 ID。写作时将观察、推测和验证结果表述清楚；初始文章的发布时间表示本站整理时间。

博客列表支持 `q` 与 `tag` 参数，例如 `/blog/?tag=Architecture`。复制筛选后的地址即可分享当前阅读主题。

## 截图与视频

将截图放到 `public/media/项目名/`。frontmatter 中继续填写 `/media/mcards/gameplay.webp` 这样的站内路径，页面组件会加入部署前缀。MDX 正文中的媒体使用 `withBase` 生成地址；线上地址会以 `/2hard4meTAT/` 开头。图片写明宽高以保留布局空间：

```mdx
import { withBase } from '../../lib/urls';

<figure>
  <img
    src={withBase('/media/mcards/gameplay.webp')}
    alt="卡牌进入流程槽后，右侧面板展示执行状态"
    width="1600"
    height="900"
    loading="lazy"
    decoding="async"
  />
  <figcaption>填写截图版本与演示内容。</figcaption>
</figure>
```

项目 `media` 中的图片进入详情图库，可点击放大。现有封面是概念示意，图注需要保留这一事实；换成实拍后再将图注改为截图说明。

视频使用原生播放器，让读者主动加载：

```mdx
import { withBase } from '../../lib/urls';

<figure>
  <video
    controls
    playsinline
    preload="none"
    poster={withBase('/media/mcards/video-poster.webp')}
    width="1600"
    height="900"
  >
    <source src={withBase('/media/mcards/demo.mp4')} type="video/mp4" />
    <track kind="captions" src={withBase('/media/mcards/demo.zh.vtt')} srclang="zh" label="中文" default />
  </video>
  <figcaption>填写演示操作、版本和关键观察。</figcaption>
</figure>
```

有语音说明时提供字幕，静音演示可将操作过程写进图注。大视频可将 `source` 换成独立媒体托管的真实 HTTPS 地址，封面继续使用本地资源。避免自动播放；对演示视频同时保留静态截图和文字概要。

## 内容校对与发布

1. 检查个人职责、项目状态、时间和结果是否有依据。性能数字附环境、测试方法与记录。
2. 检查图片授权与可公开范围。Unreal 研究只使用可公开示例和个人整理；实习公司的私有源码、内部截图和数据留在原有保密环境。
3. 运行 `npm run verify`，修复 Schema、类型或链接问题。
4. 通过 `npm run preview` 阅读桌面与手机页面，操作搜索、筛选和图库。
5. 由站点所有者审核后提交到 GitHub 生产分支，按部署日志完成线上核验。
