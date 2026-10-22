# 开发札记 · 工程作品集

面向 2027 届软件工程春招的个人作品集与技术博客，聚焦 Game Development、C++ Systems、Agent Infrastructure。采用 Astro 5、严格 TypeScript、Tailwind CSS 4 与 MDX，构建为独立静态站点。

包含首页、项目列表与案例详情、博客列表与文章、关于和 404 页面。项目与文章由 Content Collections 管理，筛选、搜索、主题、图库和阅读辅助使用原生 TypeScript。

## 1. 本地启动

推荐使用 Node.js 22.11+ 与 npm：

```sh
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://localhost:4321`。依赖变更后使用 `npm install` 更新锁文件，并提交 `package-lock.json`。

## 2. 修改个人资料

编辑 `src/data/profile.ts` 集中更新资料：`name` 是站点品牌，`personName` 是可选的真实姓名；学校、专业、届别、城市与介绍文案均有独立字段。`github`、`email`、`resume` 填写后显示相应入口。

社交分享图为 `public/images/social-card.png`，可编辑同目录的 SVG 源文件后重新导出 PNG，让分享卡片与个人资料保持一致。

简历 PDF 放入 `public/resume.pdf`，将 `resume` 设置为 `/resume.pdf`。技术方向名称与描述在 `src/data/tracks.ts` 维护。

## 3. 添加项目

在 `src/content/projects/` 新建一个英文短横线文件名的 `.mdx`，例如 `my-project.mdx`；文件名对应 `/projects/my-project/`。复制现有项目的 frontmatter，更新标题、分类、标签、状态、封面、媒体和正文。

`track` 支持 `game`、`engine`、`agent`；`featured` 控制精选，`order` 控制顺序。简历可链接到 `/projects/?track=game`。完整字段与案例结构见 [内容维护指南](docs/content-guide.md)。

## 4. 写 MDX 文章

在 `src/content/blog/` 新建 `.mdx`，填写 `title`、`description`、`publishedAt`、`tags` 和 `category`。正文使用二、三级标题形成目录；代码块注明语言以启用高亮。实质修订时填写 `updatedAt`。

文章进入列表、搜索、标签筛选和 RSS；阅读时长按正文估算。初始文章日期为本站整理日期，项目开发时间以各项目的真实记录为准。

## 5. 添加截图与视频

截图放到 `public/media/项目名/`，在项目的 `cover` 和 `media` 中填写以 `/media/` 开头的路径，同时写清 `alt` 与 `caption`。当前 SVG 封面标注为“概念示意”；换成真实截图后，将 `coverKind` 设置为 `screenshot` 并更新图片说明。

视频通过 MDX 的原生 `<video controls preload="none">` 按需加载，配备封面与文字说明。大文件可使用独立媒体托管；主要页面内容和封面继续保留在站内。可直接复制的示例见 [媒体维护](docs/content-guide.md#截图与视频)。

## 6. 执行检查

```sh
npm run verify
npm run preview
```

`verify` 依次执行类型检查、生产构建和自动化测试。成功构建后，静态文件位于 `dist/`。`preview` 用于检查生产产物。

| 命令             | 用途                         |
| ---------------- | ---------------------------- |
| `npm run check`  | Astro 与 TypeScript 检查     |
| `npm run build`  | 生成静态页面、RSS 和 Sitemap |
| `npm test`       | 运行项目测试                 |
| `npm run verify` | 按顺序完成上述三项           |

发布前在 375px、768px、1440px 宽度检查布局，并使用键盘验证导航、筛选、主题、图库、文章目录和代码复制。性能评分需在实际环境测量，详见 [验收说明](docs/deployment.md#发布前后验证)。

## 7. 通过 GitHub 更新线上站点

代码仓库为 [bobby23327/2hard4meTAT](https://github.com/bobby23327/2hard4meTAT)，生产分支为 `main`。本目录交付时缺少 Git 元数据，首次提交前需关联该远程仓库，并在 EdgeOne 控制台核对 Git 集成。检查改动并运行 `npm run verify` 后，由站点所有者提交和推送。EdgeOne 按生产分支配置触发构建。

仓库内 `edgeone.json` 配置安装命令 `npm ci --include=dev --include=optional`、构建命令 `npm run check && npm run build` 和产物目录 `dist`。`.npmrc` 确保开发依赖与平台原生包参与安装，并检查 Node 版本兼容性。上线前在平台设置 `SITE_URL` 为真实 HTTPS 站点源地址；本地默认值为 `http://localhost:4321`。

GitHub Actions 使用 `.nvmrc` 指定的 Node.js 22.11.0，在 Linux 生产环境执行干净安装和 `npm run verify`。构建工具版本的兼容约束见 [部署指南](docs/deployment.md#构建依赖兼容性)。

本次实现保留在本地，推送与发布由站点所有者决定。区域、域名、免费计划及首次部署检查见 [部署指南](docs/deployment.md)。

## 8. 添加服务端动态功能

先按需添加独立 API，静态页面继续保留。GitHub 数据可先在构建时更新；评论、CMS 发布和 Agent Demo 再接入 EdgeOne Functions，并为需要保存的状态配置 KV 或 Blob。密钥仅在构建端或服务端读取。

运行边界、审核、校验、限流和 SSR 迁移方案见 [架构说明](docs/architecture.md)。

## 目录

```text
src/
  content/projects/  项目案例 MDX
  content/blog/      技术文章 MDX
  content.config.ts  内容 Schema
  data/              个人资料与技术方向
  components/        复用组件
  layouts/           页面布局
  pages/             路由、RSS 等输出
  scripts/           浏览器交互
  styles/            设计变量与全局样式
public/              封面、截图、图标和简历
docs/                架构、内容与部署指南
tests/               自动化测试
```

GitHub 主页与联系邮箱已配置。后续优先补充真实姓名、简历、游戏截图与录屏，再按项目填入可复核的测试记录和公开资源。Agent Infrastructure 保留待完善状态；Unreal 研究内容以可公开知识为边界。
