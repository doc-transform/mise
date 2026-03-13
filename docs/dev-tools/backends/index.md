# 工具源（Backends）

工具源是 mise 用于安装[工具](/dev-tools/index.html)和[插件](/plugins.html)的包管理器或生态系统。每个工具源都可以从其生态系统中安装和管理多种工具。例如，`npm` 工具源可以安装 `npm:prettier` 等多种工具，`pipx` 工具源可以安装 `pipx:black` 等工具。这使得 mise 能够借助不同的包管理器及其生态系统，支持各种各样的工具和语言。

当你运行 [`mise use`](/cli/use.html) 命令时，mise 会根据你要管理的工具自动判断应使用的工具源。工具源随后会负责安装、配置以及其他必要步骤，确保工具可以正常使用。

关于工具源在 mise 整体设计中的定位，请参阅[工具源架构文档](/dev-tools/backend_architecture.html)。

以下是 mise 中可用的工具源列表：

- [asdf](/dev-tools/backends/asdf)（通过[插件](/plugins.html)提供工具）
- [aqua](/dev-tools/backends/aqua)
- [cargo](/dev-tools/backends/cargo)
- [conda](/dev-tools/backends/conda) <Badge type="warning" text="experimental" />
- [dotnet](/dev-tools/backends/dotnet) <Badge type="warning" text="experimental" />
- [forgejo](/dev-tools/backends/forgejo)
- [gem](/dev-tools/backends/gem)
- [github](/dev-tools/backends/github)
- [gitlab](/dev-tools/backends/gitlab)
- [go](/dev-tools/backends/go)
- [http](/dev-tools/backends/http)
- [npm](/dev-tools/backends/npm)
- [pipx](/dev-tools/backends/pipx)
- [s3](/dev-tools/backends/s3) <Badge type="warning" text="experimental" />
- [spm](/dev-tools/backends/spm) <Badge type="warning" text="experimental" />
- [ubi](/dev-tools/backends/ubi)
- [vfox](/dev-tools/backends/vfox)（通过[插件](/plugins.html)提供工具）
- [自定义工具源](/backend-plugin-development)（构建自己的工具源插件，一个插件即可提供多种工具）
