# 常见问题

## 我不想在项目中放 `mise.toml`/`.tool-versions` 文件，因为 git 会显示为未跟踪文件

使用 [`mise.local.toml`](https://mise.jdx.dev/configuration.html#mise-toml) 并将其加入全局 gitignore 文件中。这个文件永远不应被提交。

如果你确实想使用 `mise.toml` 或 `.tool-versions`，以下是三种让 git 忽略这些文件的方法：

- 将 `mise.toml` 添加到项目的 `.git/info/exclude` 中。这个文件是项目本地的，无需提交。
- 将 `mise.toml` 添加到项目的 `.gitignore` 文件中。缺点是你需要提交对该忽略文件的更改。
- 将 `mise.toml` 添加到全局 gitignore（`core.excludesFile`）中。这会让 git 在所有项目中忽略 `mise.toml` 文件。如果需要，你可以使用 `git add --force mise.toml` 显式添加。

## "nodejs" 和 "node"（或 "golang" 和 "go"）有什么区别？

它们是别名关系。例如，`mise use nodejs@14.0` 等同于 `mise install node@14.0`。这意味着不可能让它们成为不同的插件。

这是为了方便使用，这样你不必记住哪个是"官方"名称。不过，如果别名方面出了问题，请提交工单或直接使用 "node" 和 "go"。在底层，当 mise 读取配置文件或接收 CLI 输入时，会自动替换 "nodejs" 和 "golang"。

## `mise activate` 做了什么？

它注册了一个 shell 钩子，在每次显示命令提示符时运行 `mise hook-env`。`mise hook-env` 会检查当前的环境变量（最重要的是 `PATH`，但对于某些工具还有 `GOROOT` 或 `JAVA_HOME` 等），并添加/删除/更新已变更的变量。

例如，如果你 `cd` 到一个指定了 `java 18` 而不是 `java 17` 的目录，在下次显示提示符之前，shell 会运行 `eval "$(mise hook-env)"`，这将在当前 shell 会话中执行类似这样的命令：

```sh
export JAVA_HOME=$HOME/.local/share/installs/java/18
export PATH=$HOME/.local/share/installs/java/18/bin:$PATH
```

实际上更新 `PATH` 比这更复杂，因为还需要移除 java-17 的路径，但你应该理解大概原理了。

你可能觉得每次显示提示符都运行 `mise hook-env` 太过频繁了，应该只在 `cd` 时运行。然而有很多情况下即使目录没有变化也需要运行它，例如在当前 shell 中刚刚编辑了 `.tool-versions` 或 `mise.toml`。

因为它在提示符显示时运行，如果你在非交互式会话（如 bash 脚本）中使用 `mise activate`，它永远不会调用 `mise hook-env`，因此实际上永远不会修改 PATH，因为它从不显示提示符。对于这种情况，你可以在每次需要更新 PATH 时手动调用 `mise hook-env`，或者改用 [shims](/dev-tools/shims.md)（推荐）。如果你只需要在某些命令中使用 mise，可以给命令加上 [`mise x --`](./cli/exec) 前缀。例如，`mise x -- npm test` 或 `mise x -- ./my_script.sh`。

`mise hook-env` 在没有变更的情况下会提前退出。这可以避免每次运行命令时给 shell 提示符增加延迟。你可以自己运行 `mise hook-env` 看看它输出了什么，不过如果你在一个已经激活了 mise 的 shell 中，很可能什么都不会输出。

`mise activate` 还会在大多数 shell 中创建一个名为 `mise` 的 shell 函数。这是一个技巧，使得 `mise shell` 和 `mise deactivate` 可以直接工作，而无需将它们包在 `eval "$(mise shell)"` 中。

## Windows 支持？

::: warning
虽然 mise 在 WSL 中运行良好，但也支持原生 Windows，不过目前需要通过 shims 方式使用，直到有人添加 [PowerShell](https://github.com/jdx/mise/discussions/6733) 支持。

由于需要使用 shims，这意味着你无法从 mise.toml 获取环境变量，除非通过 [`mise x`](/cli/exec) 或 [`mise run`](/cli/run) 来运行——不过这实际上也是我在 Mac 上使用 mise 的方式，对我来说这是首选的工作流程。
:::

## 如何在 HTTP 代理环境下使用 mise？

简短回答：只需设置 `http_proxy` 和 `https_proxy` 环境变量。这些变量应该使用小写。

如果插件没有配置使用这些环境变量，可能不会生效。如果你在安装某个特定工具时遇到代理相关的问题，请在该插件的仓库中提交 issue。

## 插件短名称是如何映射到仓库的？

例如：`mise plugin install elixir` 是如何知道要从 <https://github.com/asdf-vm/asdf-elixir> 获取的？

我们维护了一个 mise 用作基础的[短名称索引](https://github.com/mise-plugins/registry)。它会在每次 mise 发布时定期更新。这个仓库直接存储在代码库的 [registry/](https://github.com/jdx/mise/blob/main/registry/) 中。

## "node@20" 是指最新可用版本的 node 吗？

取决于命令。通常在大多数命令和配置文件中，"node@20" 指向最新*已安装*的 node-20.x 版本。你可以通过运行 `mise latest --installed node@20` 或查看 `~/.local/share/mise/installs/node/20` 符号链接指向的位置来找到这个版本：

```sh
$ ls -l ~/.local/share/mise/installs/node/20
[...] /home/jdx/.local/share/mise/installs/node/20 -> node-v20.0.0-linux-x64
```

以下几个命令是例外：

- `mise install node@20`
- `mise latest node@20`
- `mise upgrade node@20`

这些会使用最新*可用*的 node-20.x 版本。这通常是合理的，因为你不会想安装一个已经安装过的版本。

## 如何从 asdf 迁移？

- 安装 mise 并按照[快速开始指南](/getting-started)中的说明配置 `mise activate`
- 从 shell rc 文件中移除 asdf
- 在包含 asdf `.tool-versions` 文件的目录中运行 `mise install`，mise 会安装相应的工具

::: info
请注意，`mise` 不会像 `asdf` 那样将 `~/.tool-versions` 视为全局配置文件。`mise` 使用 `~/.config/mise/config.toml` 作为全局配置。
:::

以下是一个可以用来迁移全局 `.tool-versions` 文件的示例脚本：

```shell
mv ~/.tool-versions ~/.tool-versions.bak
cat ~/.tool-versions.bak | tr -s ' ' | tr ' ' '@' | xargs -n2 mise use -g
```

当你对 mise 使用感到满意后，可以删除 `.tool-versions.bak` 文件并[卸载 `asdf`](https://asdf-vm.com/manage/core.html#uninstall)。

## mise 与 asdf 的兼容性如何？

mise 应该能够读取/安装任何 asdf 使用的 `.tool-versions` 文件。任何 asdf 插件都应该可以在 mise 中使用。mise 的命令与 asdf 略有不同，例如 `mise install node@20.0.0` vs `asdf install node 20.0.0`——这是为了可以一次指定多个工具。不过 asdf 风格的语法仍然支持：（`mise install node 20.0.0`）。大多数命令都是如此，虽然命令帮助中可能会注明支持 asdf 风格的语法。如果不确定，直接尝试 asdf 语法看看能不能用——通常是可以的。

::: info
更新说明（2025-01-01）：mise 设计上与 bash 编写的 asdf（<=0.15）兼容。用 Go 重写的新版 asdf（>=0.16）有一些 mise 不支持的命令，如 `asdf set`。`mise set` 是一个已有的完全不同于 `asdf set` 的命令——在 mise 中它用于设置环境变量。

这与可用性无关，更多是为了确保在插件代码中调用 asdf 命令的插件能继续工作。
:::

使用 `mise use` 等命令可能会输出与 asdf 不兼容的 `.tool-versions` 文件，例如使用模糊版本。你可以设置 `--pin` 或 `MISE_PIN=1` 让 `mise use` 在 `.tool-versions` 中输出 asdf 兼容的版本。或者，你可以让 `mise.toml` 和 `.tool-versions` 并存。同一目录中 `mise.toml` 定义的工具会覆盖 `.tool-versions` 中定义的工具。

话虽如此，与 asdf 的兼容性已不再是设计目标。长期以来，没有理由偏好 asdf 而非 mise，因此用户应该迁移过来。虽然有很多用户的团队同时使用两者，但这种配置出现的问题不太可能被优先处理。

## 如何禁用/强制 CLI 颜色输出？

mise 使用 [console.rs](https://docs.rs/console/latest/console/fn.colors_enabled.html)，遵循 [clicolors 规范](https://bixense.com/clicolors/)：

- `CLICOLOR != 0`：支持 ANSI 颜色，当程序没有通过管道时应使用颜色。
- `CLICOLOR == 0`：不输出 ANSI 颜色转义码。
- `CLICOLOR_FORCE != 0`：无论如何都启用 ANSI 颜色。

## mise 安全吗？

提供安全的供应链至关重要。与 asdf 相比，mise 已经提供了更安全的使用体验。欢迎安全方面的评估和贡献。我们也敦促用户关注所使用的插件安全性，敦促插件作者保护用户安全。

更多详情请参阅 [SECURITY.md](https://github.com/jdx/mise/blob/main/SECURITY.md)。

## 什么是 usage？

usage（<https://usage.jdx.dev/>）是一个用于定义 CLI 工具的规范和命令行工具。

参数、标志、环境变量和配置文件都可以在 Usage 规范中定义。可以把它理解为 CLI 的 OpenAPI（swagger）。

`usage` 可以通过 `mise use -g usage` 安装，使用它才能让自动补全功能正常工作。参见[自动补全](/installing-mise.html#autocompletion)。

你可以在文件任务中利用 usage 来实现自动补全，参见[文件任务参数](/tasks/file-tasks.html#arguments)。

## 什么是 pitchfork？

pitchfork（<https://pitchfork.jdx.dev/>）是一个面向开发者的进程管理器。

它提供守护进程管理功能，包括故障自动重启、智能就绪检查、进入项目目录时的 shell 自动启动/停止，以及定时任务的 cron 式调度。

## Windows 下 VSCode 扩展报错 `spawn EINVAL`

在 VSCode 中，由于一个 [Node.js 安全修复](https://nodejs.org/en/blog/vulnerability/april-2024-security-releases-2#command-injection-via-args-parameter-of-child_processspawn-without-shell-option-enabled-on-windows-cve-2024-27980---high)，许多扩展会抛出 "error spawn EINVAL" 错误。

默认的 `exe` shim 模式应该能解决此问题。如果你使用的是旧模式，可以将 [windows_shim_mode](https://mise.jdx.dev/configuration/settings.html#windows_shim_mode) 更改为 `exe`、`hardlink` 或 `symlink`。

## mise 的版本号是怎么工作的？

mise 使用[日历化版本号](https://calver.org/)（`2024.1.0`）。破坏性变更会很少，但确实发生时，会尽可能在 CLI 中提前通知。

与使用语义化版本号的大版本来传达大型发布中的变更不同，新功能和变更可以通过 `experimental = true` 等设置来选择性启用。这样插件作者和用户可以立即测试新功能而无需等待大版本发布。

日历化版本号中的数字（YYYY.MM.RELEASE）仅表示发布日期，而非兼容性或新增了多少功能。每次发布都是小规模的增量更新。
