# GitHub Pages 部署指南

本项目由 Astro 5 生成静态产物，输出目录为 `dist/`。仓库为 [bobby23327/2hard4meTAT](https://github.com/bobby23327/2hard4meTAT)，发布地址为 [https://bobby23327.github.io/2hard4meTAT/](https://bobby23327.github.io/2hard4meTAT/)。

## 构建与发布设置

| 项目         | 设置                                                         |
| ------------ | ------------------------------------------------------------ |
| 工作流       | `Deploy GitHub Pages`，定义于 `.github/workflows/deploy.yml` |
| 生产分支     | `main`                                                       |
| 安装命令     | `npm ci --include=dev --include=optional`                    |
| 验证命令     | `npm run verify`                                             |
| 输出目录     | `dist`                                                       |
| Node.js      | `22.11.0`，由 `.nvmrc` 指定                                  |
| 站点源地址   | `SITE_URL=https://bobby23327.github.io`                      |
| 部署路径     | `SITE_BASE=/2hard4meTAT/`                                    |
| Pages 发布源 | **GitHub Actions**                                           |

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。推送到 `main` 后，工作流执行检查、上传静态产物并通过 `deploy-pages` 发布；Pull Request 运行构建与测试；`workflow_dispatch` 支持手动重新部署。Pages 部署任务使用 `github-pages` 环境，所需权限在工作流中声明。参见 [GitHub 自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 与 [Astro GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)。

当前代码已移除 EdgeOne 部署配置。原 EdgeOne 项目的 Git 集成状态需在其控制台确认；需要停止该平台后续构建时，在控制台解除关联或暂停项目。

## 构建依赖兼容性

`astro check` 依赖 `@astrojs/check` 和 TypeScript；Vite、Tailwind 使用当前操作系统的原生包。安装命令显式包含 `dev` 与 `optional`，`.npmrc` 同步设置安装策略并启用 `engine-strict`，使 Node 版本问题在安装时暴露。

项目固定 Vite 6.4.5、`@astrojs/check` 0.9.9，并通过 `overrides` 固定 `@astrojs/language-server` 2.16.16 与 `unifont` 0.7.4，保持与 Node.js 22.11.0 的兼容性。`package-lock.json` 保留 Linux 与 Windows 原生包的可选依赖记录。升级依赖时同步更新锁文件，并在 Linux 工作流中验证。

## 站点地址与子路径

`SITE_URL` 只填写 HTTP(S) 源地址，`SITE_BASE` 单独指定部署路径。当前 GitHub Pages 使用以下组合：

```dotenv
SITE_URL=https://bobby23327.github.io
SITE_BASE=/2hard4meTAT/
```

Astro 的 `site` 与 `base` 配置分别接收这两个值。站内导航、图片、下载、文章和项目链接通过统一路径工具添加前缀；canonical、Open Graph、RSS 与 Sitemap 使用同一站点配置。内容中的本地资源仍填写 `/images/...`、`/media/...` 或 `/resume.pdf`，避免重复添加仓库名称。参见 [Astro 配置参考](https://docs.astro.build/en/reference/configuration-reference/#base)。

本地开发默认使用 `http://localhost:4321` 和 `/`。在 PowerShell 中验证 Pages 路径：

```powershell
$env:SITE_URL = 'https://bobby23327.github.io'
$env:SITE_BASE = '/2hard4meTAT/'
npm run verify
npm run preview
```

打开终端显示的本地服务地址，并访问 `/2hard4meTAT/`。完成后清理临时配置：

```powershell
Remove-Item Env:SITE_URL, Env:SITE_BASE
```

若改用自定义域名，先在 Pages 中绑定域名，再将工作流的 `SITE_URL` 更新为该域名源地址、`SITE_BASE` 更新为 `/`，重新构建发布。参见 [GitHub Pages 自定义域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)。

## 更新与回滚

1. 修改内容或代码，运行 `npm run verify`，使用 `npm run preview` 检查生产页面。
2. 检查变更并提交，推送或合并到 `main`。
3. 打开仓库的 **Actions**，确认对应提交的构建和部署任务成功。
4. 访问部署任务显示的 Pages 地址，检查页面、媒体、链接及订阅文件。
5. 需要回滚时，通过 `git revert` 撤销造成回归的提交并推送，由工作流重新发布。

部署是否完成以 GitHub Actions 记录与线上访问结果为准。手动重部署可在工作流页面使用 **Run workflow**，选择 `main`。

## 发布前后验证

| 检查             | 方法与通过依据                                                  |
| ---------------- | --------------------------------------------------------------- |
| 安装与类型       | 干净安装和 `npm run check` 正常退出                             |
| 根路径与项目路径 | 分别以 `/` 和 `/2hard4meTAT/` 构建、测试                        |
| 生产构建         | `dist/` 包含预期页面、RSS、robots 和 Sitemap                    |
| 静态资源         | CSS、脚本、封面、图标与简历链接包含正确部署前缀                 |
| 页面与交互       | 首页、列表、详情、关于、404、筛选、主题、图库与代码复制实际可用 |
| 响应式           | 375px、768px、1440px 布局可读，检查横向溢出                     |
| 可访问性         | Tab 焦点可见，Escape 关闭弹层，减少动效偏好生效                 |
| SEO              | canonical、Open Graph、RSS、Sitemap 使用线上域名和项目路径      |
| 平台部署         | Actions 对应提交的构建、上传和部署任务成功                      |
| 性能             | 在真实网络测量 LCP、CLS 与加载体积，记录工具和环境              |

具体执行记录见 [验收记录](verification.md)。

## 动态功能边界

GitHub Pages 提供静态托管。构建期数据同步继续在 Actions 中执行；评论、在线发布、Agent Demo 等动态功能接入独立 API 服务。需要 Astro SSR 时，选择支持对应适配器的服务端平台，重新验证运行时、路由和静态资源配置。详见 [架构与扩展](architecture.md)。
