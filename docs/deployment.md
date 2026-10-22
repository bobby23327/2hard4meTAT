# EdgeOne Makers 部署指南

本版通过 Astro 5 生成完整静态产物，输出目录为 `dist/`。本次工作仅在本地实现与验证，GitHub 推送和线上发布由站点所有者确认后执行。

## 已知状态与兼容性

交付目录开始时为空，且缺少 `.git` 元数据。用户提供了 GitHub 已关联 EdgeOne、生产分支为 `main` 的背景；该关联需在真实仓库与平台控制台核验。

EdgeOne 官方指南支持 Astro 4+，推荐 Astro 5，并支持 SSG 与 Content Collections。本项目选择 Astro 5 静态模式；具体依赖版本以 `package-lock.json` 为准。[官方 Astro 指南](https://pages.edgeone.ai/document/framework-astro)

## 构建设置

| 项目 | 设置 |
| --- | --- |
| 仓库根目录 | 本项目所在目录 |
| 生产分支 | `main`，与现有关联核对 |
| 安装命令 | `npm ci --include=dev --include=optional` |
| 构建命令 | `npm run check && npm run build` |
| 输出目录 | `dist` |
| Node.js | `22.11.0`，与 `edgeone.json` 一致 |
| 环境变量 | `SITE_URL` 为真实 HTTPS 源地址 |

`edgeone.json` 已设置安装、构建、输出目录及静态资源缓存头，仓库配置会覆盖对应控制台选项。[配置文档](https://pages.edgeone.ai/document/edgeone-json)

`edgeone.json` 指定官方文档列出的预装版本 `22.11.0`，本地推荐 Node.js 22.11+。首次上线时核对构建日志中的实际版本；升级依赖后同步检查 `engines` 要求，并在对应版本执行安装与构建。[Node 配置说明](https://pages.edgeone.ai/document/edgeone-json)

## 构建依赖兼容性

`astro check` 需要 `@astrojs/check` 和 TypeScript；Vite、Tailwind 使用当前操作系统的原生包。安装命令显式包含 `dev` 与 `optional`，`.npmrc` 同步设置安装策略并启用 `engine-strict`，使 Node 版本问题在安装时暴露。[npm 安装参数](https://docs.npmjs.com/cli/v10/commands/npm-ci/#include)

为匹配 EdgeOne 的 Node.js 22.11.0，项目固定 Vite 6.4.5、`@astrojs/check` 0.9.9，并通过 `overrides` 固定 `@astrojs/language-server` 2.16.16 与 `unifont` 0.7.4。这些版本分别避免自动引入要求更高 Node 版本的 Vite 8 / Rolldown、Astro 检查工具链与 Undici 8。升级前应一起更新锁文件，并通过 Linux CI。

`package-lock.json` 保留 Linux 与 Windows 原生包的可选依赖记录。部署时使用提交的锁文件完成干净安装。若安装日志仍显示旧命令，在控制台确认当前部署的提交 SHA 和项目根目录；首次重试可清除旧构建缓存。

GitHub Actions 的 `Verify site` 工作流在 Linux、Node.js 22.11.0、`NODE_ENV=production` 下执行相同安装命令和 `npm run verify`，覆盖类型检查、静态构建及产物测试。

## 站点地址与 SEO

上线前在 EdgeOne 项目环境变量中设置真实的 `SITE_URL`，例如自己的 HTTPS 域名源地址。配置仅接受 HTTP(S) URL，并使用其 origin 生成 canonical、Open Graph、RSS 和 Sitemap 地址。`SITE_URL` 是公开站点配置。

本地默认值为 `http://localhost:4321`。生产构建时省略该变量会使生成的绝对地址指向本地，因此每次更换生产域名后应重新构建。

PowerShell 本地验证方式：

```powershell
$env:SITE_URL = 'https://your-domain.example'
npm run verify
npm run preview
```

将示例域名替换为实际域名。开发完成后可用 `Remove-Item Env:SITE_URL` 清理当前终端中的临时设置。

## 区域、域名与费用

使用 **Global availability zone（excluding Chinese mainland）** 区域，官方文档明确该区域的自定义域名无需 ICP 备案。包含中国大陆的全球区与中国大陆区对应不同备案要求，选择时核对完整区域名称。[域名与区域说明](https://pages.edgeone.ai/document/domain-overview)

平台项目域名与部署域名在中国大陆网络下需要使用系统生成的预览 URL，其有效期为 3 小时。面向上海招聘团队的长期简历链接建议绑定自定义域名，并从实际使用网络验证访问与媒体加载。自定义域名提供稳定地址，跨境访问表现仍需实测。[域名访问规则](https://pages.edgeone.ai/document/domain-overview)

官方免费计划支持 Git 部署、自动构建和静态站点，本版静态功能可在免费计划内运行。已有域名可以直接用于绑定；新购域名属于独立费用。发布前核对当期额度和账户状态。[价格页](https://pages.edgeone.ai/pricing)

## 通过现有 GitHub 流程更新

1. 在已关联的真实仓库中检查 `git remote -v` 与当前分支，将本项目文件和锁文件放入正确目录。
2. 在 EdgeOne 控制台确认仓库、生产分支、构建目录、Node 版本和 `SITE_URL`。
3. 本地执行 `npm ci`、`npm run verify`，然后运行 `npm run preview` 检查生产页面。
4. 阅读变更并提交到仓库，由站点所有者决定何时推送或合并到 `main`。
5. 推送后在平台部署记录中确认触发的提交 SHA、分支、安装日志、构建日志与输出目录。
6. 预览通过后检查生产域名和各详情页；出现回归时使用平台历史部署回滚，并在仓库修复原因。

Git 推送自动触发取决于现有项目的 Git 集成和生产分支设置。首次正式验证以平台生成的新部署记录为依据。[Git 部署入口](https://pages.edgeone.ai/document/importing-a-git-repository)

## 发布前后验证

本地自动化检查与线上验收分开记录，后者在实际部署后完成。

| 检查 | 方法与通过依据 |
| --- | --- |
| 安装与类型 | `npm ci`、`npm run check` 正常退出 |
| 生产构建 | `npm run build` 生成 `dist/` 与预期路由 |
| 自动化测试 | `npm test` 正常退出，检查实际测试摘要 |
| 静态页面 | 首页、列表、详情、关于与 404 均可导航 |
| 交互 | 项目筛选、技术标签、搜索、主题、移动菜单、图库与代码复制实际可用 |
| 响应式 | 375px、768px、1440px 布局可读，无横向溢出 |
| 可访问性 | Tab 焦点可见，Escape 关闭弹层，减少动效偏好生效 |
| SEO | 线上 canonical、Open Graph、RSS、Sitemap 使用真实域名 |
| 外部资源 | 真实 GitHub、简历、演示资源与媒体可访问 |
| 性能 | 在真实网络测量 LCP、CLS 与加载体积，记录工具和环境 |
| 平台部署 | 部署记录中的提交 SHA、生产分支和状态符合预期 |

性能分数、部署成功状态和公网访问结果以实际测量为准。需要追加自动化浏览器测试时，可围绕筛选 URL、主题持久化和图库焦点建立回归用例。

## 服务端升级

后续 API 可以与静态站点共存。先按需求增加 Functions，再选择 KV 或 Blob 保存必要状态。若启用 Astro SSR，使用官方 `@edgeone/astro`；其默认输出目录为 `.edgeone`，需按实际构建产物重新配置平台。详见 [架构与扩展](architecture.md)。

以上平台信息核查于 **2026-10-22**，发布时复核运行时版本、价格与区域政策。
