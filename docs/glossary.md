# 术语表

本术语表定义了 mise 文档中使用的关键术语和概念。

## 核心概念

**激活（Activation）**
: 将 mise 的上下文（工具、环境变量、PATH 修改）加载到 shell 会话中的过程。通常通过在 shell rc 文件中添加 `eval "$(mise activate bash)"` 来完成。参见[安装 mise](/installing-mise) 了解设置说明。

**工具源（Backend）**
: mise 用来安装和管理工具的包管理器或生态系统。每个工具源知道如何从其对应的来源获取、安装和管理工具。参见下方的[工具源](#backends)和[工具源架构](/dev-tools/backend_architecture)了解详情。

**核心工具（Core Tools）**
: 用 Rust 编写的内置工具实现，随 mise 一起发布。为 Node.js、Python、Ruby、Go 等流行语言提供一等支持。参见[核心工具](/core-tools)查看完整列表。

**mise.toml**
: mise 项目的主配置文件。包含工具版本、环境变量、任务和钩子。参见[配置](/configuration)了解完整规范。

**mise.local.toml**
: 用户本地的配置文件，覆盖 `mise.toml` 中的设置。通常添加到 `.gitignore` 中，用于不应与团队共享的个人设置。

**插件（Plugin）**
: 为 mise 添加功能的扩展，例如管理额外的工具或设置环境变量。参见[插件](/plugins)了解概述。

**注册表（Registry）**
: 将用户友好的短名称映射到完整工具源规范的工具别名集合。例如，`aws-cli` 映射到 `aqua:aws/aws-cli`。参见[注册表](/registry)。

**工具（Tool）**
: mise 可以安装和管理的开发工具或运行时，如 `node`、`python`、`terraform` 或 `jq`。

**工具请求（Tool Request）**
: 用户对工具版本的指定，可以是模糊的或使用别名。例如：`node@18`、`python@latest`、`go@1.21`。这些会被解析为具体的工具版本。

**工具版本（Tool Version）**
: 工具的具体已解析版本。例如，`node@18`（工具请求）可能解析为 `node@18.19.0`（工具版本）。

**工具集（Toolset）**
: 针对特定上下文解析的不可变工具集合，包含应在某个目录或项目中激活的所有工具版本。

## 工具源

mise 支持多种工具源，从不同来源安装工具：

**aqua**
: 使用 [aqua-proj](https://aquaproj.github.io/) 注册表的工具源。支持 SLSA 来源验证，提供数千种工具。参见 [aqua 工具源](/dev-tools/backends/aqua)。

**asdf**
: 兼容 [asdf](https://asdf-vm.com/) shell 脚本插件的旧版工具源。仅限 Linux 和 macOS。比原生工具源慢，但提供了对 asdf 插件生态的访问。参见 [asdf 工具源](/dev-tools/backends/asdf)。

**cargo**
: 通过 `cargo install` 编译安装 Rust 工具。参见 [cargo 工具源](/dev-tools/backends/cargo)。

**conda**
: 从 Conda 仓库安装包。参见 [conda 工具源](/dev-tools/backends/conda)。

**dotnet**
: 安装 .NET 工具。参见 [dotnet 工具源](/dev-tools/backends/dotnet)。

**gem**
: 将 Ruby gem 作为工具安装。参见 [gem 工具源](/dev-tools/backends/gem)。

**github**
: 直接从 GitHub releases 安装工具。参见 [github 工具源](/dev-tools/backends/github)。

**gitlab**
: 直接从 GitLab releases 安装工具。参见 [gitlab 工具源](/dev-tools/backends/gitlab)。

**go**
: 使用 `go install` 安装 Go 工具。参见 [go 工具源](/dev-tools/backends/go)。

**http**
: 从任意 HTTP/HTTPS URL 安装工具。参见 [http 工具源](/dev-tools/backends/http)。

**npm**
: 从 npm 注册表安装 Node.js 包和 CLI 工具。参见 [npm 工具源](/dev-tools/backends/npm)。

**pipx**
: 使用 pipx 在隔离环境中安装 Python CLI 工具。参见 [pipx 工具源](/dev-tools/backends/pipx)。

**spm**
: 通过 Swift Package Manager 安装工具。参见 [spm 工具源](/dev-tools/backends/spm)。

**ubi**
: 通用二进制安装器，用于以单个二进制文件形式分发的工具。参见 [ubi 工具源](/dev-tools/backends/ubi)。

**vfox**
: 兼容 [VersionFox](https://vfox.lhan.me/) 插件的工具源。参见 [vfox 工具源](/dev-tools/backends/vfox)。

## Shell 集成

**hook-env**
: `mise hook-env` 命令，用于导出 shell 集成所需的环境变更。通过 `mise activate` 安装的 shell 钩子会自动调用它。

**PATH 激活**
: 默认的 shell 集成方式，mise 在每次提示符显示时更新 `PATH` 环境变量以包含适当的工具可执行文件。

**Reshim**
: 在工具安装或移除后更新 shims 目录的过程。如果 shims 不同步，运行 `mise reshim`。

**Shims**
: 小型可执行脚本，拦截工具命令并委托给 mise。mise 在执行前加载适当的工具上下文。作为 PATH 激活的替代方案。参见 [Shims](/dev-tools/shims)。

## 配置

**config_root**
: mise 在解析配置文件中的相对路径时使用的规范项目根目录。通过 `MISE_PROJECT_ROOT` 环境变量设置或自动检测。

**配置环境（Configuration Environments）**
: 环境特定的配置文件，如 `mise.dev.toml` 或 `mise.prod.toml`，通过 `MISE_ENV` 环境变量激活。参见[配置环境](/configuration/environments)。

**配置层级（Configuration Hierarchy）**
: 不同层级（系统、全局、项目）的 mise.toml 文件合并的系统，距离当前目录越近的文件优先级越高。

**设置（Settings）**
: 存储在 `~/.config/mise/settings.toml` 中的全局 mise 配置选项，定义所有项目的行为。参见[设置](/configuration/settings)。

**模板（Templates）**
: 使用 Tera 模板语法的动态配置值，如 <span v-pre>`{{env.HOME}}`</span> 或 <span v-pre>`{{arch()}}`</span>。参见[模板](/templates)。

## 环境变量

**env.\_ 指令**
: 用于高级配置的特殊环境配置指令：

- `env._.file` - 从文件（如 `.env`）加载变量
- `env._.path` - 向 PATH 前置目录
- `env._.source` - 执行 shell 脚本

**延迟求值（Lazy Evaluation）**
: 使用 `tools = true` 配置的环境变量，可以访问工具提供的环境变量。它们在工具加载后才求值。

**脱敏（Redaction）**
: 使用 `redact = true` 标记敏感环境变量，以在 mise 输出和日志中隐藏其值。

## 钩子

**钩子（Hooks）**
: 在 mise 激活期间特定事件时自动执行的脚本。这是一个实验性功能。参见[钩子](/hooks)。

**cd 钩子**
: 在 mise 激活状态下每次切换目录时运行。

**enter 钩子**
: 当进入一个 mise.toml 变为活动状态的目录时运行。

**leave 钩子**
: 当离开一个 mise.toml 处于活动状态的目录时运行。

**postinstall 钩子**
: 在工具成功安装后运行。

**preinstall 钩子**
: 在工具安装开始前运行。

**watch_files 钩子**
: 当指定文件发生变更时运行。需要 `mise activate` 来监视文件。

## 任务

**依赖图（Dependency Graph）**
: 内部使用的有向无环图（DAG），根据依赖关系解析任务执行顺序。

**文件任务（File Tasks）**
: 定义为独立可执行脚本的任务，位于 `mise-tasks/` 或 `.mise/tasks/` 等目录中。参见[文件任务](/tasks/file-tasks)。

**任务（Task）**
: 在 mise.toml 中定义的或作为独立脚本的可复用命令，在 mise 环境中执行。参见[任务](/tasks/)。

**任务依赖（Task Dependencies）**
: 通过 `depends`（之前运行）、`depends_post`（之后运行）或 `wait_for`（等待但不触发）定义的任务间关系。参见[任务配置](/tasks/task-configuration)。

**TOML 任务**
: 直接在 mise.toml 文件的 `[tasks]` 段落中定义的任务。参见 [TOML 任务](/tasks/toml-tasks)。

## 目录与环境

**MISE_CACHE_DIR**
: mise 缓存下载文件和元数据的目录。在 Linux 上默认为 `~/.cache/mise`，在 macOS 上为 `~/Library/Caches/mise`。

**MISE_DATA_DIR**
: mise 存储已安装工具和其他持久数据的目录。默认为 `~/.local/share/mise`。

**MISE_PROJECT_ROOT**
: 自动设置为当前项目根目录（即 mise.toml 所在位置）的环境变量。

## 其他术语

**别名（Aliases）**
: 工具版本的替代名称，允许使用 `lts` 等快捷方式来指代 Node.js LTS 版本。参见[工具别名](/dev-tools/aliases)。

**direnv**
: 一个外部环境管理工具，mise 可以与之协同工作。参见 [direnv 集成](/direnv)。

**mise-en-place**
: 法语烹饪术语，意为"各就各位"——这正是 mise 的设计哲学。厨师在烹饪前准备好所有食材；开发者也应该在编码前准备好所有工具。

**mise.lock**
: 锁文件，记录精确的已解析版本，确保跨机器和 CI 的环境可重现性。参见 [mise.lock](/dev-tools/mise-lock)。

**工具选项（Tool Options）**
: mise.toml 中改变工具行为的配置，例如设置 Python `virtualenv` 路径或 Node.js `corepack` 偏好。
