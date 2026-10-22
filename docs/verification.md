# 实现与验收记录

记录日期：2026-10-22。站点采用 Astro 静态构建，当前部署目标为 GitHub Pages。以下分别记录已完成的验收与本轮迁移检查。

## 交付范围

- Astro 5.18.2、严格 TypeScript、Tailwind CSS 4、MDX Content Collections；输出目录为 `dist/`。
- 13 个 HTML 页面：首页、项目列表、5 个项目详情、博客列表、3 篇文章、关于及 404。
- 项目分类、关键词与技术标签筛选，精选/名称排序，URL 参数分享与回退恢复。
- 博客搜索与标签、阅读时长、发布/更新日期、相邻文章、代码高亮与复制、目录高亮、滚动进度。
- 深浅主题与偏好记忆、移动导航、键盘操作、画廊缩略图、原生图片弹层、方向键与关闭焦点恢复。
- RSS、Sitemap、robots、规范链接、PNG Open Graph 分享图和本地资源。
- 个人资料集中维护，项目与文章通过 MDX 添加；概念封面可通过 `coverKind` 切换为真实截图。

## 主要文件

| 文件                                                                     | 实现内容                                                    |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `astro.config.mjs`、`package.json`、`package-lock.json`、`tsconfig.json` | 框架、依赖锁定、构建与严格类型配置                          |
| `.github/workflows/deploy.yml`、`.env.example`、`.nvmrc`                 | GitHub Pages 部署、站点源地址、路径和 Node 配置             |
| `src/layouts/BaseLayout.astro`、`src/styles/global.css`                  | SEO、共享布局、响应式设计系统                               |
| `src/pages/index.astro`、`about.astro`、`404.astro`                      | 首页、个人资料及错误页                                      |
| `src/pages/projects/index.astro`、`[slug].astro`                         | 项目筛选列表与案例模板                                      |
| `src/pages/blog/index.astro`、`[slug].astro`                             | 博客列表与文章模板                                          |
| `src/pages/rss.xml.ts`、`robots.txt.ts`                                  | 构建期订阅与爬虫文件                                        |
| `src/components/`                                                        | 导航、卡片、文章行、概念视觉、画廊、目录与页脚              |
| `src/scripts/filters.ts`、`gallery.ts`、`reading.ts`、`site.ts`          | 浏览器交互                                                  |
| `src/lib/content.ts`、`dom.ts`、`viewport.ts`                            | 内容工具、必需元素校验、滚动帧调度                          |
| `src/content.config.ts`、`src/data/profile.ts`、`tracks.ts`              | 类型安全内容 Schema 和可维护资料                            |
| `src/content/projects/`                                                  | Mcards、视界限、夜班旅馆、Unreal 研究、Agent Infrastructure |
| `src/content/blog/`                                                      | 模拟边界、双窗口坐标、程序化地图验证三篇工程笔记            |
| `public/images/`、`public/favicon.svg`                                   | 五张原创概念封面、架构示意与分享图                          |
| `tests/build.test.mjs`                                                   | 静态输出验收测试                                            |
| `README.md`、`docs/content-guide.md`、`architecture.md`、`deployment.md` | 使用、内容维护、扩展与部署说明                              |

## 已完成的基础验收

初版在本机 Node.js 24.19.0 验证。此前的部署依赖修复已使用 Node.js 22.11.0 在 Windows 下完成干净安装和全部检查，并以 `NODE_ENV=production` 验证安装参数可覆盖开发依赖及可选依赖的省略设置。对应的 Linux 验证见 [GitHub Actions 记录](https://github.com/bobby23327/2hard4meTAT/actions/runs/39729652221)。这些记录对应迁移 GitHub Pages 之前的版本。

| 检查                                      | 结果                                      |
| ----------------------------------------- | ----------------------------------------- |
| `npm ci --include=dev --include=optional` | Node.js 22.11.0 生产环境下成功            |
| `npm run verify`                          | 成功                                      |
| Astro / TypeScript 检查                   | 32 个文件，0 错误、0 警告、0 提示         |
| 生产构建                                  | 13 页、RSS、robots、Sitemap，输出 `dist/` |
| Node 自动化验收                           | 6 组全部通过                              |
| `.env` 站点地址读取                       | 正确读取 `SITE_URL`                       |
| 非源地址形式的 `SITE_URL`                 | 明确抛出 `TypeError`                      |

自动化测试覆盖必需路由、页面语义与元数据、图片尺寸与替代文本、Open Graph 文件格式和签名、内部链接及锚点、项目状态和技术内容、robots 与 Sitemap 的源地址一致性。

本环境的 Node 运行时未附带 npm 命令入口，验收使用 `.tools/` 内的临时 npm 工具和关闭遥测的进程环境。该目录已由 Git 忽略；正常 Node.js/npm 安装可直接运行 README 中的命令。

## GitHub Pages 迁移检查

本轮已分别以根路径 `/` 与项目路径 `/2hard4meTAT/` 完成构建和测试。Astro 检查 34 个文件，结果为 0 错误、0 警告。Linux 环境和线上发布在推送后由新工作流验证。

| 检查                       | 当前记录                           |
| -------------------------- | ---------------------------------- |
| 根路径构建与测试           | 构建成功，6 组测试通过             |
| 项目路径构建与测试         | 构建成功，6 组测试通过             |
| 链接、媒体、SEO 与订阅路径 | 两轮静态产物测试通过               |
| Linux 干净安装与检查       | 以新部署工作流记录为准             |
| Pages 发布和公网访问       | 以对应提交的部署与实际访问结果为准 |

发布地址为 `https://bobby23327.github.io/2hard4meTAT/`；构建配置使用 `SITE_URL=https://bobby23327.github.io` 和 `SITE_BASE=/2hard4meTAT/`。部署工作流与验证方式见 [部署指南](deployment.md)。

## 已完成的浏览器验收

通过本机静态生产预览进行检查：

- 全部 13 页在 375px、768px、1440px 视口下通过横向溢出检查；抽查首页、列表、案例与文章的实际截图。
- 项目方向筛选、Godot 关键词、C# 标签、名称排序、空结果、重置和刷新后的筛选恢复均正常。
- 重置筛选后焦点返回搜索框；无效标签与博客中的项目专属参数会规范化。
- 博客搜索“坐标”和 WFC 标签得到对应文章；从文章返回列表保留筛选。
- 主题切换在刷新后保留；移动导航支持展开、Esc 收起并恢复焦点。
- 图片缩略图切换、放大、左右方向键、Esc 关闭及焦点返回均正常。
- 文章目录跳转与高亮、阅读进度、代码复制成功反馈均正常。
- 检查过程中的页面控制台记录为空；已加载媒体均正常显示。

截图和逐页尺寸记录保存在本地 `test-results/`，该目录用于验收记录并由 Git 忽略。性能需结合真实域名与访问区域测量，本次记录不包含 Lighthouse 评分。

## 内容与上线前准备

GitHub 主页与联系邮箱已配置。待补充真实姓名、简历 PDF、游戏截图与录屏、各项目的公开仓库和演示链接，以及实际测试记录。夜班旅馆按开发中展示，Agent Infrastructure 按待完善展示；Unreal 页面以公开技术研究为边界。

GitHub Pages 的发布源选择 GitHub Actions，推送 `main` 后由工作流构建和部署。生产地址及子路径由工作流统一设置；上线后检查首页、详情、404、静态媒体与分享信息。原 EdgeOne 项目的 Git 集成是否继续启用，需在其控制台确认。

后续先补齐真实项目材料，再按需要增加构建期 GitHub 数据和 CMS；评论与 Agent Demo 的服务端边界见架构文档。
