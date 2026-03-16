# 配置

了解如何通过 `mise.toml` 文件、环境变量和各种配置选项为项目配置 mise，管理你的开发环境。

## `mise.toml`

`mise.toml` 是 mise 的配置文件。它可以位于以下路径（按优先级从高到低排列，上层覆盖下层）：

- `mise.local.toml` - 用于本地配置，不应提交到版本控制
- `mise.toml`
- `mise/config.toml`
- `.mise/config.toml`
- `.config/mise.toml` - 将配置文件归入通用目录时使用
- `.config/mise/config.toml`
- `.config/mise/conf.d/*.toml` - 该目录下的所有文件按字母顺序加载

::: tip
运行 [`mise cfg`](/cli/config.html) 可以查看 mise 在你的环境中实际加载文件的顺序。这通常比自己理清 mise 的规则要简单得多。
:::

说明：

- 以 `mise` 开头的路径也可以是点文件，例如 `.mise.toml` 或 `.mise/config.toml`。
- 此列表不包括[配置环境](/configuration/environments)，它支持按环境加载配置文件，如 `mise.development.toml`——通过 `MISE_ENV=development` 来设置。
- 实际的路径列表及优先级规则请参阅 [`LOCAL_CONFIG_FILENAMES`（`src/config/mod.rs`）](https://github.com/jdx/mise/blob/main/src/config/mod.rs)。为简洁起见，部分旧版路径未在此列出。

## 配置层级

mise 使用一套精细的层级配置系统，可以合并来自多个来源的设置。理解这套层级结构有助于你高效组织开发环境。

### 配置合并机制

配置文件沿目录树向上递归查找。例如，如果你有 `~/src/work/myproj/mise.toml`，其中的定义会覆盖 `~/src/work/mise.toml` 或 `~/.config/mise.toml` 中的同名配置。配置内容会被合并在一起。

### 配置解析流程

当 mise 需要配置时，它会按以下流程操作：

1. **从当前目录向上遍历**目录树，直到根目录（或 `MISE_CEILING_PATHS` 指定的位置）
2. **收集沿途找到的所有配置文件**
3. **按顺序合并**，更具体（离当前目录更近）的配置覆盖更宽泛的配置
4. 如果设置了 `MISE_ENV`，还会**应用环境专属配置**（如 `mise.dev.toml`）

### 配置层级示意图

```
/
├── etc/mise/                         # 系统级配置（最高优先级）
│   ├── conf.d/*.toml                 # 系统配置片段，按字母顺序加载
│   ├── config.toml                   # 系统默认配置
│   └── config.<env>.toml             # 环境专属系统配置（MISE_ENV 或 -E）
└── home/user/
    ├── .config/mise/
    │   ├── conf.d/*.toml             # 用户配置片段，按字母顺序加载
    │   ├── config.toml               # 全局用户配置
    │   ├── config.<env>.toml         # 环境专属用户配置
    │   ├── config.local.toml         # 用户本地覆盖配置
    │   └── config.<env>.local.toml   # 环境专属用户本地覆盖配置
    └── work/
        ├── mise.toml                 # 工作区级配置
        └── myproject/
            ├── mise.local.toml       # 本地覆盖配置（应被 git 忽略）
            ├── mise.toml             # 项目配置
            ├── mise.<env>.toml       # 环境专属项目配置
            ├── mise.<env>.local.toml # 环境专属项目本地覆盖配置
            └── backend/
                └── mise.toml         # 服务级配置（最低优先级）
```

### 各配置节的合并行为

不同配置节的合并方式不同：

**工具** (`[tools]`)：追加并覆盖

```toml
# 全局: node@18, python@3.11
# 项目: node@20, go@1.21
# 结果: node@20, python@3.11, go@1.21
```

**环境变量** (`[env]`)：追加并覆盖

```toml
# 全局: NODE_ENV=development
# 项目: NODE_ENV=production, API_URL=localhost
# 结果: NODE_ENV=production, API_URL=localhost
```

**任务** (`[tasks]`)：按任务整体替换

```toml
# 全局: [tasks.test] = "npm test"
# 项目: [tasks.test] = "yarn test"
# 结果: "yarn test"（完全替换全局定义）
```

**设置** (`[settings]`)：追加并覆盖

```toml
# 全局: experimental = true
# 项目: jobs = 4
# 结果: experimental = true, jobs = 4
```

::: tip
运行 `mise config` 可以查看 mise 已加载的配置文件及其优先级顺序。
:::

### 写入操作的目标文件

当 [`mise use`](/cli/use)、[`mise set`](/cli/set) 或 [`mise unuse`](/cli/unuse) 等命令需要写入配置文件时，它们会选择**最高优先级目录中优先级最低的文件**。具体来说：

- 如果同时存在 `mise.toml` 和 `mise.local.toml`，写入 `mise.toml`
- 如果同时存在 `mise.toml` 和 `mise.production.toml`，写入 `mise.toml`
- 如果只存在 `mise.local.toml`，则写入 `mise.local.toml`

这样做是为了确保默认更新共享配置（`mise.toml`），而本地覆盖配置（`mise.local.toml`）和环境专属配置除非明确指定，否则不会被修改。

::: info 示例

```bash
# 同时存在 mise.toml 和 mise.local.toml 时：
$ mise use node@22              # 写入 mise.toml
$ mise use --env local node@20  # 写入 mise.local.toml
$ mise set NODE_ENV=production  # 写入 mise.toml
```

:::

以下是一个 `mise.toml` 的示例：

```toml
[env]
NODE_ENV = 'production'

[tools]
terraform = '1.0.0'
erlang = '24.0'

[tasks.build]
run = 'echo "running build tasks"'
```

`mise.toml` 文件是层级化的。当前目录中的配置会覆盖父目录中的冲突配置。例如，如果 `~/src/myproj/mise.toml` 定义了：

```toml
[tools]
node = '20'
python = '3.10'
```

而 `~/src/myproj/backend/mise.toml` 定义了：

```toml
[tools]
node = '18'
ruby = '3.1'
```

那么在 `~/src/myproj/backend` 目录下，`node` 版本为 `18`，`python` 版本为 `3.10`，`ruby` 版本为 `3.1`。你可以通过 `mise ls --current` 查看当前激活的版本。

你还可以使用环境专属配置文件，如 `.mise.production.toml`，详见[配置环境](/configuration/environments)。

### `[tools]` - 开发工具

参阅[工具](/dev-tools/)。除了指定版本外，每个工具条目还可以包含以下选项：

- `os`：限制仅在特定操作系统上安装
- `install_env`：安装时使用的环境变量
- `postinstall`：该工具安装完成后执行的命令

示例：

```toml
[tools]
node = { version = "22", postinstall = "corepack enable" }
```

### `[env]` - 自定义环境变量

参阅[环境变量](/environments/)。

### `[tasks.*]` - 运行文件或 Shell 脚本

参阅[任务](/tasks/)。

### `[settings]` - mise 设置项

参阅[设置项](/configuration/settings)了解完整的设置列表。

### `[plugins]` - 指定自定义插件仓库 URL

使用 `[plugins]` 来添加或修改插件简称。注意这只会影响**新安装**的插件，已有插件可以使用任意 URL。

```toml
[plugins]
elixir = "https://github.com/my-org/mise-elixir.git"
node = "https://github.com/my-org/mise-node.git#DEADBEEF" # 支持指定 git ref
"vfox-backend:myplugin" = "https://github.com/jdx/vfox-npm"
```

插件类型前缀（如 `asdf:`、`vfox:` 或 `vfox-backend:`）是可选的。如果省略，mise 会根据仓库名称中是否包含 `vfox-` 来决定使用 `asdf` 还是 `vfox`。

如果你只是想从某个特定 URL 安装一次插件，建议使用 `mise plugin install <NAME> <GIT_URL>`。如果希望与项目中的其他开发者共享插件位置和版本，再将此配置添加到 `mise.toml` 中。

这类似于 [`MISE_SHORTHANDS`](https://github.com/jdx/mise#mise_shorthands_fileconfigmiseshorthandstoml)，但不需要额外的文件。

### `[tool_alias]` - 工具版本别名

::: tip
`[alias]` 已更名为 `[tool_alias]`，以便与 `[shell_alias]` 区分。旧的 `[alias]` 键仍然有效，但已弃用。
:::

以下配置使 `mise install node@my_custom_node` 实际安装 node-20.x，这也可以在[插件](/dev-tools/aliases.md)中指定。注意添加别名也会创建一个符号链接，例如：

```sh
~/.local/share/mise/installs/node/20 -> ./20.x.x
```

```toml
[tool_alias.node.versions]
my_custom_node = '20'
```

### `[shell_alias]` - Shell 别名

定义在进入目录时设置、离开时取消的 shell 别名：

```toml
[shell_alias]
ll = "ls -la"
gs = "git status"
dev = "npm run dev"
```

这些别名的工作方式类似于环境变量——基于当前目录动态设置。详见 [Shell 别名](/shell-aliases)。

### 最低 mise 版本

指定配置文件所需的最低 mise 版本。

你可以设置硬性最低版本（不满足时报错）或软性最低版本（不满足时警告并继续）：

```toml
# （等同于硬性要求）
min_version = '2024.11.1'

# 新的对象形式
min_version = { hard = '2024.11.1' }

# 软性建议
min_version = { soft = '2024.11.1' }

# 同时设置
min_version = { hard = '2024.11.1', soft = '2024.9.0' }
```

当软性最低版本不满足时，mise 会打印警告，并（如果可用）显示自更新说明。当硬性最低版本不满足时，mise 会报错并显示自更新说明。

### Monorepo 根目录 <Badge type="warning" text="实验性" />

将配置文件标记为 monorepo 根目录，以启用任务的目标路径语法。需要设置 `MISE_EXPERIMENTAL=1`。

```toml
experimental_monorepo_root = true
```

启用后：

- 子目录中的任务可以通过命名空间路径访问（如 `//projects/frontend:build`）
- 子目录任务可使用父级配置中的工具
- 任务仅在需要时加载（如运行任务时，或使用 `mise tasks ls --all` 时）
- 当根目录被信任后，所有子目录的配置文件都会**自动被信任**
- 无需逐个信任每个子目录的配置

详见 [Monorepo 任务](/tasks/monorepo)的使用方法和示例。

### `mise.toml` Schema

- `mise.toml` 的 JSON Schema 位于 [schema/mise.json](https://github.com/jdx/mise/blob/main/schema/mise.json) 或 <https://mise.jdx.dev/schema/mise.json>。
- 部分编辑器可以自动加载 Schema，在编辑 `mise.toml` 时提供自动补全和验证（[VSCode](https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings)、[IntelliJ](https://www.jetbrains.com/help/idea/json.html#ws_json_using_schemas)、[neovim](https://github.com/b0o/SchemaStore.nvim) 等）。该 Schema 也收录在 [JSON Schema Store](https://www.schemastore.org/) 中。
- 注意，对于"引入的任务"（参阅[任务配置](/tasks/task-configuration)），有另一个 Schema：<https://mise.jdx.dev/schema/mise-task.json>

## 全局配置：`~/.config/mise/config.toml`

mise 可以在 `~/.config/mise/config.toml` 中配置。它类似于本地 `mise.toml`，但对所有目录生效。

```toml [~/.config/mise/config.toml]
[tools]
# 全局工具版本设置在这里
# 可以通过 `mise use -g` 来设置
node = 'lts'
python = ['3.10', '3.11']

[settings]
# 工具可以读取其他版本管理器使用的版本文件
# 例如，node 的 nvm 使用的 .nvmrc
idiomatic_version_file_enable_tools = ['node']

# 配置 `mise install` 始终保留下载的压缩包
always_keep_download = false        # 默认安装后删除
always_keep_install = false         # 默认失败后删除

# 配置获取插件仓库更新的频率（分钟）
# 每次安装新运行时时更新
# （注意：此功能尚未实现，但计划添加：https://github.com/jdx/mise/discussions/6735）
plugin_autoupdate_last_check_duration = '1 week' # 设为 0 禁用更新

# 以下前缀的配置文件默认被信任
trusted_config_paths = [
    '~/work/my-trusted-projects',
]

verbose = false       # 设为 true 查看完整安装输出，参阅 `MISE_VERBOSE`
http_timeout = "30s"  # HTTP 请求超时时间（duration 格式），参阅 `MISE_HTTP_TIMEOUT`
jobs = 4              # 并行安装插件或运行时的数量，默认为 `4`
raw = false           # 设为 true 直接将插件脚本管道连接到 stdin/stdout/stderr
yes = false           # 设为 true 自动回答所有提示为 yes

not_found_auto_install = true # 参阅 MISE_NOT_FOUND_AUTO_INSTALL
task.output = "prefix" # 参阅任务运行器了解更多信息
paranoid = false       # 参阅 MISE_PARANOID

shorthands_file = '~/.config/mise/shorthands.toml' # 简称文件路径，参阅 `MISE_SHORTHANDS_FILE`
disable_default_shorthands = false # 禁用默认简称，参阅 `MISE_DISABLE_DEFAULT_SHORTHANDS`
disable_tools = ['node']           # 禁用特定工具，通常用于关闭核心工具

env_file = '.env' # 从 dotenv 文件加载环境变量，参阅 `MISE_ENV_FILE`

experimental = true # 启用实验性功能

# 配置进入包含配置文件的目录时显示的消息
status = {
  missing_tools = "if_other_versions_installed",
  show_env = false,
  show_tools = false,
}

# "_" 是特殊键，用于存放你想放入 mise.toml 但 mise 不会解析的信息
[_]
foo = "bar"
```

## 系统配置：`/etc/mise/config.toml`

类似于 `~/.config/mise/config.toml`，但对系统中所有用户生效。适合为所有用户设置默认值。

## `.tool-versions`

`.tool-versions` 是 asdf 的配置文件，在 mise 中也可以像 `mise.toml` 一样使用。由于灵活性不如 `mise.toml`，建议优先使用 `mise.toml`。如果你已有大量 `.tool-versions` 文件，或团队中有人在用 asdf，它仍然很有用。

以下是一个包含所有支持语法的示例：

```text
node        20.0.0       # 支持注释
ruby        3            # 支持模糊版本号
shellcheck  latest       # 也支持 "latest"
jq          1.6
erlang      ref:master   # 从 VCS ref 编译
go          prefix:1.19  # 使用最新的 1.19.x 版本——当 "1.19" 精确匹配时需要加 prefix
shfmt       path:./shfmt # 使用自定义运行时
node        lts          # 使用 node 的 LTS 版本（不是所有插件都支持）

node        sub-2:lts      # 安装比 LTS 低 2 个大版本的版本（如 LTS 为 20 则安装 18）
python      sub-0.1:latest # 如果最新版是 3.11 则安装 python-3.10
```

更多关于此文件格式的信息请参阅 [asdf 文档](https://asdf-vm.com/manage/configuration.html#tool-versions)。

## 版本作用域

`mise.toml` 和 `.tool-versions` 都支持"作用域"，用于修改版本的行为：

- `ref:<SHA>` - 从 VCS（通常是 git）的 ref 编译
- `prefix:<PREFIX>` - 使用匹配前缀的最新版本。对 Go 特别有用，因为 `1.20` 只会精确匹配 `1.20`，而 `prefix:1.20` 会匹配 `1.20.1`、`1.20.2` 等
- `path:<PATH>` - 使用指定路径上的自定义运行时。一个用途是复用 Homebrew 安装的工具（如 `path:/opt/homebrew/opt/node@20`）
- `sub-<PARTIAL_VERSION>:<ORIG_VERSION>` - 从 ORIG_VERSION 中减去 PARTIAL_VERSION。可以用来表达"比 LTS 低 2 个版本"（如 `sub-2:lts`），或"比最新版低 1 个小版本"（如 `sub-0.1:latest`）

## 惯用版本文件

mise 像 asdf 一样支持"惯用版本文件"（idiomatic version files），即各语言特有的版本文件，如 `.node-version` 和 `.python-version`。它们非常适合为项目设置运行时版本，而不强制其他开发者使用 mise 或 asdf 等特定工具。

这些文件支持别名，例如你可以在 `.nvmrc` 中写 `lts/hydrogen`，它在 mise 和 nvm 中都能正常工作。以下是部分支持的惯用版本文件：

| 插件       | 惯用版本文件                          |
| ---------- | ------------------------------------- |
| atmos      | `.atmos-version`                      |
| crystal    | `.crystal-version`                    |
| elixir     | `.exenv-version`                      |
| go         | `.go-version`                         |
| java       | `.java-version`, `.sdkmanrc`          |
| node       | `.nvmrc`, `.node-version`             |
| opentofu   | `.opentofu-version`                   |
| packer     | `.packer-version`                     |
| python     | `.python-version`, `.python-versions` |
| ruby       | `.ruby-version`, `Gemfile`            |
| terraform  | `.terraform-version`, `main.tf`       |
| terragrunt | `.terragrunt-version`                 |
| terramate  | `.terramate-version`                  |
| yarn       | `.yvmrc`                              |

在 mise 中，这些文件默认是禁用的，原因请参阅 <https://github.com/jdx/mise/discussions/4345>。

- `mise settings add idiomatic_version_file_enable_tools python` 可为特定工具（如 Python）启用（[文档](/configuration/settings.html#idiomatic_version_file_enable_tools)）

解析这些文件存在一定的性能开销，因为它由插件的 `bin/parse-version-file` 执行。不过，由于有[缓存](/cache-behavior)，影响并不大，你可能不会注意到。

::: info
asdf 将这些称为"legacy version files（旧版版本文件）"。我认为这个名字不太好，因为它暗示不应该使用——而实际上完全不是这样。我更喜欢"惯用版本文件"这个术语，因为它们不是 asdf/mise 特有的，其他工具也可以使用（`.nvmrc` 是个例外，它与特定工具绑定）。
:::

## 设置项

参阅[设置项](/configuration/settings)了解完整的设置列表。

## 任务

参阅[任务](/tasks/)了解完整的配置选项。

## 环境变量

::: tip
通常 mise 中的环境变量用于配置[设置项](/configuration/settings)，因此大多数环境变量都在那篇文档中。以下是不属于设置项的环境变量。

mise 中的设置项通常是既可以通过环境变量配置，也可以在配置文件中设置的选项。
:::

mise 也可以通过环境变量来配置。以下是可用的选项：

### `MISE_DATA_DIR`

默认值：`~/.local/share/mise` 或 `$XDG_DATA_HOME/mise`

mise 存储插件和工具安装目录的路径。这些内容不应跨机器共享。

### `MISE_CACHE_DIR`

默认值（Linux）：`~/.cache/mise` 或 `$XDG_CACHE_HOME/mise`
默认值（macOS）：`~/Library/Caches/mise` 或 `$XDG_CACHE_HOME/mise`

mise 存储内部缓存的目录。不应跨机器共享。在 mise 未运行时可以随时删除。

### `MISE_TMP_DIR`

默认值：Rust 中 [`std::env::temp_dir()`](https://doc.rust-lang.org/std/env/fn.temp_dir.html) 的实现

用于临时存储，例如安装工具时使用。

### `MISE_SYSTEM_CONFIG_DIR`

默认值：`/etc/mise`

mise 存储系统级配置的目录。
`MISE_SYSTEM_DIR` 也可以作为旧版别名使用。

### `MISE_GLOBAL_CONFIG_FILE`

默认值：`$MISE_CONFIG_DIR/config.toml`（通常是 ~/.config/mise/config.toml）

配置文件的路径。

### `MISE_GLOBAL_CONFIG_ROOT`

默认值：`$HOME`

::: v-pre
全局配置文件中 `{{config_root}}` 所对应的路径。
:::

### `MISE_ENV_FILE`

设置一个文件名，从 dotenv 文件中读取环境变量。例如：`MISE_ENV_FILE=.env`。底层使用 [dotenvy](https://crates.io/crates/dotenvy) 实现。

### `MISE_${PLUGIN}_VERSION`

设置运行时的版本。例如，`MISE_NODE_VERSION=20` 会使用 <node@20.x>，无论 `mise.toml`/`.tool-versions` 中如何设置。

### `MISE_TRUSTED_CONFIG_PATHS`

mise 自动标记为信任的路径列表，多个路径用 `:` 分隔。

### `MISE_CEILING_PATHS`

mise 停止向上搜索配置文件和文件任务的路径列表。适用于阻止 mise 搜索加载缓慢的目录。分隔符遵循平台 PATH 环境变量的约定，大多数 Unix 平台使用 `:`，Windows 使用 `;`。

### `MISE_LOG_LEVEL=trace|debug|info|warn|error`

调整 mise 的日志级别。

也可以使用 `MISE_DEBUG=1`、`MISE_TRACE=1`、`MISE_QUIET=1` 以及 `--log-level=trace|debug|info|warn|error`。

### `MISE_LOG_FILE=~/mise.log`

将日志输出到文件。

### `MISE_LOG_FILE_LEVEL=trace|debug|info|warn|error`

与 `MISE_LOG_LEVEL` 相同，但针对日志**文件**的输出级别。当你想保存日志但不希望它们干扰终端显示时很有用。

### `MISE_LOG_HTTP=1`

在日志中显示 HTTP 请求和响应。

### `MISE_QUIET=1`

等同于 `MISE_LOG_LEVEL=warn`。

### `MISE_HTTP_TIMEOUT`

设置 HTTP 请求的超时时间（秒），默认值为 `30`。

### `MISE_RAW=1`

设为 "1" 可将插件脚本直接管道连接到 stdin/stdout/stderr。默认情况下 stdin 是禁用的，因为并行安装多个插件时无法看到提示。如果某个插件需要交互式输入或安装似乎不正常，可以使用此选项。

同时会设置 `MISE_JOBS=1`，因为同一时间只能执行一个插件脚本。

### `MISE_FISH_AUTO_ACTIVATE=1`

配置 fish shell 的 vendor_conf.d 脚本是否自动激活 mise。该文件在 homebrew 等安装方式中自动使用，无需手动配置即可激活 mise。

默认启用，设为 "0" 可禁用。
