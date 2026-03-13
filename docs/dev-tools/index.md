# 开发工具

> _类似于 [asdf](https://asdf-vm.com)（或 [nvm](https://github.com/nvm-sh/nvm)、[pyenv](https://github.com/pyenv/pyenv)，但支持任何语言），mise 管理 node、python、cmake、terraform 等[数百种](/registry.html)开发工具。_

`mise` 是一个管理编程语言运行时和其他本地开发工具安装的工具。例如，它可以在同一台机器上管理多个版本的 Node.js、Python、Ruby、Go 等。

[激活](/getting-started.html#activate-mise)后，mise 可以根据你所在的目录自动切换不同版本的工具。这意味着如果你有一个项目需要 Node.js 18，另一个需要 Node.js 22，mise 会在你切换项目时自动切换版本。在[工具注册表](/registry)中查看 mise 可用的工具。

mise 通过查找当前目录及其父目录中的 `mise.toml` 文件来确定使用哪个工具版本。以下是一个 [mise.toml](/configuration.html) 文件示例：

```toml [mise.toml]
[tools]
node = '22'
python = '3'
ruby = 'latest'
```

mise 也兼容 asdf 的 `.tool-versions` 文件以及[惯用版本文件](/configuration#idiomatic-version-files)（如 `.node-version` 和 `.ruby-version`）。详见[配置](/configuration)。

指定工具版本时，你还可以引用配置层级中定义的环境变量，包括由 `_.source`、`_.file` 等 env 指令或 env 模块产生的值。这些会在工具版本模板渲染之前解析。

::: info
mise 受 [asdf](https://asdf-vm.com) 启发，底层可以利用 asdf 庞大的[插件生态](https://github.com/mise-plugins/registry)。不过，[它比 asdf _快得多_，且用户体验更友好](./comparison-to-asdf)。
:::

## 工作原理

mise 通过一套精密但用户友好的系统来管理开发工具，自动处理工具安装、版本管理和环境配置。

### 工具解析流程

当你进入一个目录或运行命令时，mise 按以下流程操作：

1. **配置发现**：mise 沿目录树向上查找配置文件（`mise.toml`、`.tool-versions` 等），并按层级合并
2. **工具解析**：mise 通过注册表和版本列表将版本描述（如 `node@latest` 或 `python@3`）解析为具体版本
3. **工具源选择**：mise 为每个工具选择合适的[工具源](/dev-tools/backend_architecture)（core、asdf、aqua 等）
4. **安装检查**：mise 检查所需工具版本是否已安装，自动安装缺失的版本
5. **环境配置**：mise 配置 `PATH` 和环境变量，使用解析后的工具版本

### 环境集成

mise 提供多种方式与开发环境集成：

**自动激活**：通过 `mise activate`，mise 会挂载到 shell 提示符，在你切换目录时自动更新环境：

```bash
eval "$(mise activate zsh)"  # 在 ~/.zshrc 中
cd my-project               # 自动加载 mise.toml 中的工具
```

**按需执行**：使用 `mise exec` 在 mise 环境下运行命令，无需永久激活：

```bash
mise exec -- node my-script.js  # 使用 mise.toml 中的工具运行
```

**Shims**：mise 可以创建轻量级的包装脚本，自动使用正确的工具版本：

```bash
mise activate --shims  # 创建 shims 而非修改 PATH
```

### PATH 管理

mise 修改 `PATH` 环境变量，优先使用正确的工具版本：

```bash
# mise 之前
echo $PATH
/usr/local/bin:/usr/bin:/bin

# 在有 node@20 的项目中激活 mise 后
echo $PATH
/home/user/.local/share/mise/installs/node/20.11.0/bin:/usr/local/bin:/usr/bin:/bin
```

这确保了运行 `node` 时使用的是项目配置中指定的版本，而非系统全局安装的版本。

### 配置层级

mise 支持嵌套配置，从宽泛到具体逐层覆盖：

```bash
~/.config/mise/config.toml      # 全局默认值
~/work/mise.toml                # 工作区专用工具
~/work/project/mise.toml        # 项目专用覆盖
~/work/project/.tool-versions   # 旧版 asdf 兼容
```

每一层都可以覆盖或扩展上一层的设置，让你在不同场景下精细控制工具版本。

## 工具选项

工具选项允许你自定义工具的安装和配置方式。它们支持嵌套配置以便更好地组织，对平台特定设置尤其有用。

### 表格格式（推荐）

指定嵌套选项最清晰的方式是使用 TOML 表格：

```toml
[tools."http:my-tool"]
version = "1.0.0"

[tools."http:my-tool".platforms]
macos-x64 = {
  url = "https://example.com/my-tool-macos-x64.tar.gz",
  checksum = "sha256:abc123",
}
linux-x64 = {
  url = "https://example.com/my-tool-linux-x64.tar.gz",
  checksum = "sha256:def456",
}
```

### 点号记法

对于较简单的嵌套配置，也可以使用点号记法：

```toml
[tools."http:my-tool"]
version = "1.0.0"
platforms.macos-x64.url = "https://example.com/my-tool-macos-x64.tar.gz"
platforms.linux-x64.url = "https://example.com/my-tool-linux-x64.tar.gz"
simple_option = "value"
```

### 通用嵌套支持

任何工具源都可以使用嵌套选项来组织复杂配置：

```toml
[tools."custom:my-backend"]
version = "1.0.0"

[tools."custom:my-backend".database]
host = "localhost"
port = 5432

[tools."custom:my-backend".cache.redis]
host = "redis.example.com"
port = 6379
```

内部实现上，嵌套选项会被展平为点号记法（如 `platforms.macos-x64.url`、`database.host`、`cache.redis.port`）供工具源访问。

### 工具安装后命令

通过在工具配置中添加 `postinstall` 字段，可以在工具安装完成后立即运行命令。这与 `[hooks].postinstall` 不同，仅在该特定工具安装时触发。

```toml
[tools]
node = { version = "22", postinstall = "corepack enable" }
```

行为：

- 命令在该工具/版本安装成功后执行一次。
- 命令执行时，该工具的 bin 路径已在 PATH 中，可直接调用安装的工具。
- 环境变量包含 `MISE_TOOL_INSTALL_PATH`，指向工具的安装目录。
- 如果安装失败，`postinstall` 命令不会执行。

## 按操作系统限制工具

可以使用 `os` 字段将工具限制在特定操作系统上安装：

```toml
[tools]
# 仅在 Linux 和 macOS 上安装
ripgrep = { version = "latest", os = ["linux", "macos"] }

# 仅在 Windows 上安装
"npm:windows-terminal" = { version = "latest", os = ["windows"] }

# 可与其他选项组合使用
"cargo:usage-cli" = {
    version = "latest",
    os = ["linux", "macos"],
    install_env = { RUST_BACKTRACE = "1" }
}
```

`os` 字段接受操作系统标识符数组：

- `"linux"` - 所有 Linux 发行版
- `"macos"` - macOS (Darwin)
- `"windows"` - Windows

如果工具指定了 `os` 限制，且当前操作系统不在列表中，mise 将跳过安装和使用该工具。

## 缓存与性能

mise 使用智能缓存来最小化开销：

- **版本列表**：每天缓存，避免重复 API 调用
- **安装包**：缓存下载内容，加速重新安装
- **环境解析**：缓存环境配置，加快 shell 提示符响应
- **插件元数据**：缓存插件信息，加速操作

这确保了 mise 对你的日常开发工作流增加的延迟微乎其微。

::: info
激活后，mise 会在每次切换目录或_显示_命令提示符时更新 PATH 等环境变量。参阅 [FAQ](/faq#what-does-mise-activate-do)。
:::

激活后，每次命令提示符显示时都会调用 `mise hook-env` 来获取新的环境变量。这应该非常快——如果目录没有变化或 `mise.toml`/`.tool-versions` 文件没有修改，它会提前退出。

`mise` 会提前修改 `PATH`，使运行时被直接调用。这意味着调用工具时零开销，`which node` 之类的命令会返回实际二进制文件的路径。其他工具（如 asdf）只支持通过 shim 文件动态查找运行时，这会增加一些延迟，并可能导致某些命令出问题。详见 [shims](/dev-tools/shims)。

## 常用命令

以下是使用开发工具时最重要的命令。点击每个命令的标题可跳转到参考文档页面，查看所有可用的标志/选项和更多示例。

### [`mise use`](/cli/use)

对很多用户来说，`mise use` 可能是唯一需要学习的命令。它会执行以下操作：

- 按需安装工具的插件
- 安装指定版本
- 将该版本设为当前活动版本（即更新 `PATH`）
- 更新当前配置文件（`mise.toml` 或 `.tool-versions`）

```shell
> cd my-project
> mise use node@24
# 下载 node，验证签名...
mise node@24.x.x ✓ installed
mise ~/my-project/mise.toml tools: node@24.x.x # mise.toml 已创建/更新

> which node
~/.local/share/installs/node/24.x.x/bin/node
```

`mise use node@24` 会安装最新的 node-24 版本并在当前目录创建/更新 `mise.toml` 配置文件。只要你在该目录中，就会使用该版本的 `node`。

`mise use -g node@24` 会做同样的事，但更新[全局配置](/configuration.html#global-config-config-mise-config-toml)（~/.config/mise/config.toml），这样除非本地目录层级中有其他配置文件，node-24 就是该用户的默认版本。

### [`mise install`](/cli/install)

`mise install` 会安装但不激活工具——即将工具下载/构建/编译到 `~/.local/share/mise/installs`，但在 `.mise-toml` 或 `.tool-versions` 文件中"设置"版本之前无法使用。

::: tip
如果你从 `asdf` 迁移过来，不需要先运行 `mise plugin add` 安装插件，mise 会在需要时自动安装。当然，你也可以手动安装插件，或使用默认注册表中没有的插件。
:::

它有多种用法：

- `mise install node@20.0.0` - 安装特定版本
- `mise install node@20` - 安装匹配此前缀的最新版本
- `mise install node` - 安装 `mise.toml`（或其他配置文件）中当前指定的 node 版本
- `mise install` - 安装配置文件中指定的所有插件和工具

### [`mise exec`|`mise x`](/cli/exec)

`mise x` 可用于使用特定工具执行一次性命令。例如，如果你想用 python3.12 运行一个脚本：

```sh
mise x python@3.12 -- ./myscript.py
```

如果 Python 尚未安装，会自动安装。`mise x` 也会读取本地/全局的 `.mise-toml`/`.tool-versions` 文件，所以如果你不想使用 `mise activate` 或 shims，可以在命令前加上 `mise x --`：

```sh
$ mise use node@20
$ mise x -- node -v
20.x.x
```

::: tip
如果你经常使用这个命令，设置别名会很方便：

```sh
alias mx="mise x --"
```

:::

类似地，`mise run` 可用于[执行任务](/tasks/)，执行前也会激活 mise 环境并加载所有工具。

## 自动安装机制

mise 提供多种机制，在需要时自动安装缺失的工具或版本。以下按触发方式和时机分组说明，并列出各自的相关设置。所有机制都需要全局 [auto_install](/configuration/settings.html#auto_install) 设置已启用（**所有 auto_install 设置默认启用**）。

### 按需执行（[`mise x`](/cli/exec)、[`mise r`](/cli/run)）

运行 [`mise x`](/cli/exec) 或 [`mise r`](/cli/run) 时，mise 会自动安装执行命令所需的任何缺失工具版本。

- **触发时机**：使用 [`mise x`](/cli/exec) 或 [`mise r`](/cli/run) 时，所需工具/版本尚未安装。
- **控制方式**：
  - 设置项：[`exec_auto_install`](/configuration/settings.html#exec_auto_install)（默认：true）
  - 设置项：[`task_auto_install`](/configuration/settings.html#task_auto_install)（默认：true）

### 命令未找到处理器（Shell 集成）

如果在 shell 中输入一个命令（如 `node`）但未找到，mise 可以尝试自动安装缺失的工具版本（前提是 mise 知道哪个工具提供该二进制文件）。

- **触发时机**：shell 中找不到命令且该处理器已启用时。
- **控制方式**：
  - 设置项：[`not_found_auto_install`](/configuration/settings.html#not_found_auto_install)（默认：true）
- **限制**：仅对已安装过至少一个版本的工具有效，因为 mise 无法确定哪个工具提供某个二进制文件。

::: tip
可以通过设置 [`auto_install_disable_tools`](/configuration/settings.html#auto_install_disable_tools) 为工具名列表来禁用特定工具的自动安装。
:::
