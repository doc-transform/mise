# pipx 工具源

pipx 是一个在隔离虚拟环境中运行 Python CLI 工具的工具。这对 Python CLI 来说是必要的，因为它可以防止不同 CLI 之间或 CLI 与 Python 项目之间的依赖冲突。本质上，这个工具源让你能够将 Python CLI 工具添加到 mise 中。

需要说明的是，pipx 不是 pip，它也不用于管理一般的 Python 依赖。mise 是一个工具管理器，不是像 pip、uv 或 poetry 那样的依赖管理器。不过，你可以使用 mise 安装这些包管理器。你应该使用 pipx 工具源来安装像 "black" 这样的 CLI，而不是像 "NumPy" 或 "requests" 这样的库。

值得注意的是，如果安装了 uv，pipx 工具源实际上会默认使用 [`uvx`](https://docs.astral.sh/uv/guides/tools/)（uv 版的 pipx）。这只意味着安装速度会更快，但如果遇到某些工具与 uvx 不兼容的情况，请参阅下文的禁用或配置说明。

pipx 工具源支持以下来源：

- PyPI
- Git
- GitHub
- Http

相关代码位于 mise 仓库的 [`./src/backend/pipx.rs`](https://github.com/jdx/mise/blob/main/src/backend/pipx.rs)。

## 依赖

需要安装 `uv`（推荐）或 `pipx`。

如果你安装了 `uv`，mise 底层会使用 `uv tool install`，你不需要安装 `pipx` 就能运行包含 "pipx:" 的命令。

如果你出于其他原因需要 `pipx`，可以选择是否通过 mise 安装。
以下是通过 mise 安装 `pipx` 的方式：

```sh
mise use -g python
pip install --user pipx
```

[其他安装方式](https://pipx.pypa.io/latest/installation/)

## 用法

以下命令安装最新版本的 [black](https://github.com/psf/black) 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g pipx:psf/black
$ black --version
black, 24.3.0
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"pipx:psf/black" = "latest"
```

## Python 升级

如果 pipx 包使用的 python 版本发生变化（通过 mise 或系统 python），你可能需要重新安装该包。可以这样操作：

```sh
mise install -f pipx:psf/black
```

或者重新安装所有 pipx 包：

```sh
mise install -f "pipx:*"
```

使用 `mise up python` 时 mise _应该_会自动执行此操作。

### 支持的 pipx 语法

| 描述                          | 用法                                                   |
| ----------------------------- | ------------------------------------------------------ |
| PyPI 简写（最新版本）         | `pipx:black`                                           |
| PyPI 简写（指定版本）         | `pipx:black@24.3.0`                                    |
| GitHub 简写（最新版本）       | `pipx:psf/black`                                       |
| GitHub 简写（指定版本）       | `pipx:psf/black@24.3.0`                                |
| Git 语法（最新版本）          | `pipx:git+https://github.com/psf/black.git`            |
| Git 语法（指定分支）          | `pipx:git+https://github.com/psf/black.git@main`       |
| Https zip 文件                | `pipx:https://github.com/psf/black/archive/18.9b0.zip` |

其他语法可能可用，但不受支持且未经测试。

## 设置

通过 `mise settings set [VARIABLE] [VALUE]` 或设置对应的环境变量进行配置。

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="pipx" :level="3" />

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `pipx` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `extras`

安装额外的组件。

```toml
[tools]
"pipx:harlequin" = { version = "latest", extras = "postgres,s3" }
```

### `pipx_args`

安装包时传递给 `pipx` 的额外参数。

```toml
[tools]
"pipx:black" = { version = "latest", pipx_args = "--preinstall" }
```

### `uvx`

设为 `false` 以始终禁用此工具的 uv。

```toml
[tools]
"pipx:ansible" = { version = "latest", uvx = "false", pipx_args = "--include-deps" }
```

### `uvx_args`

安装包时传递给 `uvx` 的额外参数。

```toml
[tools]
"pipx:ansible-core" = { version = "latest", uvx_args = "--with ansible" }
```
