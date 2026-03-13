# 插件

mise 中的插件是一种扩展 `mise` 功能的方式，例如添加额外的工具或环境变量管理功能。

历史上，插件曾是添加新工具的唯一方式（因为唯一的工具源（Backend）是 [asdf](/dev-tools/backends/asdf.html)）。

该工具源的工作方式是每个工具都有自己的插件，需要手动安装。但是，现在有了[核心工具](/core-tools.html)以及 [aqua](/dev-tools/backends/aqua.html)/[github](/dev-tools/backends/github.html) 等工具源，大多数工具不再需要插件即可在 mise 中运行。

出于安全考虑，应避免使用工具插件。除非工具非常流行且 aqua/github 由于某些原因不可用，否则不会接受使用 asdf/插件构建的新工具加入 mise。

唯一的例外是工具需要设置环境变量或具有复杂的安装过程，因为插件可以提供[全局设置环境变量](/environments/#plugin-provided-env-directives)等功能，而无需依赖已安装的工具。它们还可以提供[版本别名](/dev-tools/aliases.html#aliased-versions)。

如果你想将新工具集成到 mise 中，应该先尝试将其加入 [aqua 注册表](https://mise.jdx.dev/dev-tools/backends/aqua.html)，或者查看是否可以通过 [github](https://mise.jdx.dev/dev-tools/backends/github.html) 安装。然后将其添加到[注册表](https://github.com/jdx/mise/blob/main/registry/)中。aqua 明显优于 github，因为它具有更好的用户体验和更多功能，如 slsa 验证以及对旧版本使用不同逻辑的能力。

你可以使用 [`mise plugins`](/cli/plugins.html) 管理 `mise` 中所有已安装的插件。

```shell
mise plugins ls --urls
# Plugin                          Url                                                     Ref  Sha
# 1password                       https://github.com/mise-plugins/mise-1password-cli.git  HEAD f5d5aab
# vfox-mise-plugins-vfox-dart     https://github.com/mise-plugins/vfox-dart               HEAD 1424253
# ...
```

## 工具源（Backend）插件

工具源插件通过现代工具源方法提供增强功能。这些插件使用 `plugin:tool` 格式，相比传统插件具有以下优势：

- **多工具支持**：单个插件可以管理多个工具
- **增强方法**：用于列出版本、安装和设置环境变量的工具源方法
- **跨平台**：支持 Windows、macOS 和 Linux
- **性能**：比基于 shell 的插件执行更快

使用示例：

```bash
# 安装工具源插件
mise plugin install my-plugin https://github.com/username/my-plugin

# 使用 plugin:tool 格式
mise install my-plugin:some-tool@1.0.0
mise use my-plugin:some-tool@latest
```

参见[工具源插件开发](backend-plugin-development.md)了解如何创建工具源插件。你可以使用 [mise-backend-plugin-template](https://github.com/jdx/mise-backend-plugin-template) 快速开始。

## 工具插件

工具插件使用传统的基于钩子的方式，通过 Lua 脚本实现。这些插件提供：

- **基于钩子**：使用 `PreInstall`、`PostInstall`、`Available` 等钩子
- **单工具**：每个插件管理一个工具
- **跨平台**：支持 Windows、macOS 和 Linux
- **灵活**：对安装和环境设置有完全控制

使用示例：

```bash
# 安装工具插件
mise plugin install my-tool https://github.com/username/my-tool-plugin

# 直接使用工具
mise install my-tool@1.0.0
mise use my-tool@latest
```

参见[工具插件开发](tool-plugin-development.md)了解如何创建工具插件。[mise-tool-plugin-template](https://github.com/jdx/mise-tool-plugin-template) 提供了一个开箱即用的起点。

## 环境插件

环境插件提供环境变量和 PATH 修改功能，而不管理工具版本。它们非常适合与密钥管理器集成、设置动态配置以及标准化团队环境。

使用示例：

```bash
# 安装环境插件
mise plugin install my-env-plugin https://github.com/username/my-env-plugin
```

```toml
# 在 mise.toml 中配置
[env]
_.my-env-plugin = { api_url = "https://api.example.com", debug = true }
```

与工具插件不同，环境插件：

- 仅实现环境钩子（`MiseEnv`、`MisePath`）
- 通过 `env._.<plugin-name>` 语法激活
- 不管理工具版本或安装

参见[环境插件开发](env-plugin-development.md)了解如何创建环境插件。[mise-env-plugin-template](https://github.com/jdx/mise-env-plugin-template) 仓库提供了一个开箱即用的起点。

## 通用插件使用

关于安装和使用工具源插件及工具插件的用户文档，请参见[使用插件](plugin-usage.md)。

## asdf（旧版）插件

mise 可以在底层使用 asdf 的插件生态系统来实现向后兼容。这些插件包含 shell 脚本，如 `bin/install`（用于安装）和 `bin/list-all`（用于列出所有可用版本）。

与现代工具源相比，asdf 插件有一些局限性，应该仅在必要时使用。它们只能在 Linux/macOS 上工作，并且比原生工具源更慢。

参见 [asdf（旧版）插件](asdf-legacy-plugins.md)了解使用和创建这些插件的详细文档。

## 插件作者

<https://github.com/mise-plugins> 是一个用于社区开发插件的 GitHub 组织。
有关此处插件的不同处理方式，请参见 [SECURITY.md](https://github.com/jdx/mise/blob/main/SECURITY.md)。

如果你希望将插件托管在此处，请告诉我（通过 GitHub Discussion 或 Discord 均可），我很乐意为你托管。

## 工具选项

mise 支持"工具选项"，即在 `mise.toml` 中指定的配置，用于更改工具的行为。例如 Python 运行时的虚拟环境：

```toml
[tools]
python = { version='3.11', virtualenv='.venv' }
```

这将以 `MISE_TOOL_OPTS__VIRTUALENV=.venv` 的形式传递给所有插件脚本。用户可以指定任何选项，它将以该格式传递给插件。

目前这仅支持简单字符串，但如果有需要，我们可以很容易地使其兼容更复杂的类型（数组、表）。

## 模板

插件自定义仓库值可以使用模板，详见[模板](/templates)。

```toml
[plugins]
"vfox-backend:my-plugin" = "https://{{ get_env(name='GIT_USR', default='empty') }}:{{ get_env(name='GIT_PWD', default='empty') }}@github.com/foo/my-plugin.git"
```
