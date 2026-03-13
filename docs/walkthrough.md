# 使用教程

完成[快速开始](/getting-started)指南后，你就可以开始使用 mise 了。
本文档对一些常见操作做一个快速概览。

## 安装开发工具

在 mise 中管理工具的核心命令是 [`mise u|use`](/cli/use)，它主要做两件事：

- 安装工具（如果尚未安装）
- 将工具添加到 `mise.toml` 配置文件中——在 mise 中，工具被写入 `mise.toml` 后才算"激活"

::::warning
这两步缺一不可。如果你只是通过 `mise install` 安装了工具，它并不会出现在你的 shell 中。
工具必须同时被添加到 `mise.toml`，所以推荐使用 `mise use`，因为它会一步完成这两件事。
::::

使用方式如下（注意：此示例需要先[激活 mise](/getting-started.html#activate-mise)）：

```bash
mkdir example-project && cd example-project
mise use node@24
node -v
# v24.x.x
```

此时目录下会生成一个 `mise.toml` 文件，内容如下：

```mise-toml [mise.toml]
[tools]
node = "24"
```

- 如果这个文件在项目根目录下，其他人克隆项目后只需运行 [`mise install|i`](/cli/install) 即可安装所有工具。
- 这也是你首次克隆项目或需要更新已安装工具时应该运行的命令。

## `mise.toml` 配置

你可以手动创建 `mise.toml` 文件，也可以通过 CLI 来操作。

> [!TIP]
> 使用 `mise edit` 可以打开一个交互式编辑器来编辑配置。它提供了一个 TUI 界面，你可以在其中浏览各个配置段、通过模糊搜索从注册表中添加工具，以及使用 schema 感知的自动补全来配置设置。

使用 [`mise.toml`](/configuration#mise-toml) 与团队共享工具配置。这个文件应该提交到版本控制中，包含项目所需的通用工具集。

对于你想保持私有的工具或设置，可以使用 [`mise.local.toml`](/configuration#mise-toml)。这个文件应添加到 `.gitignore` 中，适合存放个人偏好或私有配置。

`mise` 支持嵌套配置文件，从全局到项目逐级覆盖：

1. `~/.config/mise/config.toml` - 所有项目的全局设置
2. `~/work/mise.toml` - 工作目录级别的设置
3. `~/work/project/mise.toml` - 项目级别的设置
4. `~/work/project/mise.local.toml` - 项目级别的私有设置（不应共享）

`mise` 会综合所有父目录的配置来确定最终的工具集，层级越深优先级越高。

::::tip
使用 [`mise config ls`](/cli/config/ls) 可以查看当前 `mise` 正在使用的所有配置文件。
::::

通常建议在 `mise` 中使用宽松的版本号（如 `node = "24"` 而非 `node = "24.1.2"`），这样项目中的其他人不需要关心你使用的确切版本。如果需要锁定到特定版本，可以使用 `mise use --pin` 或 [`lockfile`](/configuration/settings#lockfile) 设置。

如果省略版本号，mise 会默认使用 `node@latest`。

## 工具源（Backends）

工具通过各种工具源安装，例如 `asdf`、`github` 或 `vfox`。完整的短名列表（如 `node`）请参阅[注册表](/registry.html)。

你也可以使用 `npm` 或 `cargo` 等工具源，它们可以安装对应包管理器中的任意包：

```bash
mise use npm:@antfu/ni
mise use cargo:starship
```

## 升级开发工具

工具版本升级可以通过 [`mise up|upgrade`](/cli/upgrade) 完成。默认情况下会遵循 `mise.toml` 中的版本前缀。如果存在 [lockfile](/configuration/settings#lockfile)，mise 会更新 `mise.lock` 中的版本为该前缀下的最新版本。

例如，如果 `mise.toml` 中有 `node = "24"`，那么 `mise upgrade node` 会升级到 node 24 的最新版本。

如果你想升级到 node 的最新大版本，可以使用 `mise upgrade --bump node`。它会保持与当前版本相同的精度。比如当前是 `node = "24"`，使用 `mise upgrade --bump node` 升级到 `node@26` 后，`mise.toml` 中会变为 `node = "26"`。

_更多工具管理信息请参阅[开发工具](/dev-tools/)。_

## 设置环境变量

mise 还可以用来为项目设置环境变量。可以通过 CLI 设置：

```bash
mise set MY_VAR=123
echo $MY_VAR
# 123
```

或直接在 `mise.toml` 中编辑：

```toml
[env]
MY_VAR = "123"
```

一些常见的使用场景：

- 为 Node.js 项目设置 `NODE_ENV`
- 为数据库连接设置 `DATABASE_URL`
- 为 AWS 设置 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`
- 设置 `RUST_TEST_THREADS=1` 让 cargo 测试串行执行

你还可以通过 `mise.toml` 修改 `PATH`。
以下示例可以让 `npm` 安装的 CLI 工具直接可用：

```toml
[env]
_.path = "./node_modules/.bin"
```

这会将 `./node_modules/.bin` 添加到项目的 PATH 中。这里的 "." 指的是 `mise.toml` 文件所在的目录，因此进入子目录后仍然有效。

_更多环境变量相关信息请参阅[环境变量](/environments/)。_

## 任务

任务定义在项目中，用于执行命令。

可以在 `mise.toml` 中定义任务：

```mise-toml [mise.toml]
[tasks]
build = "npm run build"
test = "npm test"
```

也可以在 `mise-tasks` 目录中作为独立文件定义，例如 `mise-tasks/build`：

```bash [mise-tasks/build]
#!/bin/bash
npm run build
```

通过 [`mise r|run`](/cli/run) 来执行任务：

```bash
mise run build
mise run test
```

::::tip
`mise run` 会在执行任务前自动设置好 mise 环境（工具和环境变量）。
因此如果你不想在 shell 中激活 mise，也可以直接用 `mise run` 来运行任务，
它会自动将工具加入 PATH 并设置 `mise.toml` 中的环境变量。
::::

`mise` 搭配 [usage](https://usage.jdx.dev) 使用，可以为任务提供丰富的文档和运行功能。

以下是一个带有 usage spec 的任务示例：

```bash [mise-tasks/greet]
#!/usr/bin/env bash
set -e

#MISE description="Greet a user with a message"
#USAGE flag "-g --greeting <greeting>" help="The greeting word to use" {
#USAGE   choices "hi" "hello" "hey"
#USAGE }
#USAGE flag "-u --user <user>" help="The user to greet"
#USAGE flag "--dir <dir>" help="The directory to greet from" default="."
#USAGE complete "dir" run="find . -maxdepth 1 -type d"
#USAGE arg "<message>" help="Greeting message"

echo "all available options are in the env with the prefix 'usage_'"
env | grep usage_

echo "${usage_greeting?}, ${usage_user?}! Your message is: ${usage_message?}"
```

这个任务可以这样运行：

```shell
mise run greet --user jdx -g "hey" "How are you?"
```

- 所有选项都会作为带 `usage_` 前缀的环境变量传递，例如 `usage_user`。
- 通过 `mise run greet --help` 可以查看帮助信息，显示任务中定义的所有选项。
- 补全功能会按预期工作：输入 `mise run greet --greeting <tab>` 会显示 `hi`、`hello` 和 `hey` 三个选项。
- 可以通过 CLI 提供[自定义补全](https://usage.jdx.dev/spec/reference/complete)。输入 `mise run greet --dir <tab>` 会执行 `find . -maxdepth 1 -type d` 来生成补全列表。

要启用自动补全功能，请先设置 [mise 自动补全](/installing-mise.html#autocompletion)。

_更多任务相关信息请参阅[任务](/tasks/)。_

## 常用命令

mise 的命令很多，以下是最常用的：

- [`mise completion`](/cli/completion) – 为你的 shell 设置自动补全。
- [`mise cfg|config`](/cli/config) – 通过 CLI 管理 `mise.toml` 文件的一系列命令。
- [`mise x|exec`](/cli/exec) – 在 mise 环境中执行命令，无需激活 mise。
- [`mise g|generate`](/cli/generate) – 为项目生成 git hooks、任务文档、GitHub Actions 等。
- [`mise i|install`](/cli/install) – 安装工具。
- [`mise link`](/cli/link) – 将通过其他方式安装的工具符号链接到 mise 中。
- [`mise ls-remote`](/cli/ls-remote) – 列出某个工具的所有可用版本。
- [`mise ls`](/cli/ls) – 列出已安装/已激活工具的信息。
- [`mise outdated`](/cli/outdated) – 检查是否有工具存在更新版本。
- [`mise plugin`](/cli/plugins) – 插件可以为 mise 扩展新功能，如额外的工具或环境变量管理。通常是 asdf 插件或现代插件。
- [`mise r|run`](/cli/run) – 运行 `mise.toml` 或 `mise-tasks` 中定义的任务。
- [`mise self-update`](/cli/self-update) – 将 mise 更新到最新版本。如果是通过包管理器安装的，请不要使用此命令。
- [`mise settings`](/cli/settings) – 通过 CLI 查看/修改配置设置。
- [`mise rm|uninstall`](/cli/uninstall) – 卸载工具。
- [`mise up|upgrade`](/cli/upgrade) – 升级工具版本。
- [`mise u|use`](/cli/use) – 安装并激活工具。
- [`mise w|watch`](/cli/watch) – 监听项目文件变化，自动运行任务。

## 最后

开发工具、环境变量和任务三者协同工作，让开发环境管理变得更轻松——尤其是团队协作时。mise 的目标是提供一个统一的交互体验，不论项目使用什么编程语言或工具，都能以一致的方式管理。

延伸阅读：

- [开发工具](/dev-tools/) – 工具管理的深入介绍
- [环境变量](/environments/) – 环境变量管理的深入介绍
- [任务](/tasks/) – 任务系统的深入介绍
- [配置](/configuration) – `mise.toml` 文件的更多信息
- [设置](/configuration/settings) – mise 中所有可用的配置项
- [工具源](/dev-tools/backends/) – mise 中所有可用工具源的索引
- [注册表](/registry) – mise 中所有可用的工具短名，如 `node`、`terraform`、`watchexec`，分别对应 `core:node`、`asdf:asdf-community/asdf-hashicorp`、`aqua:watchexec/watchexec`
- [CLI](/cli/) – mise 中所有可用命令的完整列表
