# Python

与 `pyenv` 类似，`mise` 可以在同一系统上管理多个版本的 Python。Mise 还可以为你的项目自动创建虚拟环境，并与 `uv` 集成。

> 以下是使用 python mise 核心插件的说明。只要没有通过 `mise plugins install python [GIT_URL]` 手动安装名为 "python" 的插件，就会使用核心插件。

相关代码位于 mise 仓库的
[`./src/plugins/core/python.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/python.rs)。

## 用法

以下命令安装最新版本的 python-3.11.x 并将其设为全局默认版本：

```sh
mise use -g python@3.11
```

你也可以同时使用多个 python 版本：

```sh
$ mise use -g python@3.10 python@3.11
$ python -V
3.10.0
$ python3.11 -V
3.11.0
```

你还可以安装特定的 python 风味。要获取某个风味的最新版本，只需使用风味前缀即可。

```sh
mise use -g python@anaconda         # 最新版 anaconda
```

更多常见任务和示例请参阅 [Python 实践手册](/mise-cookbook/python.html)。

## `.python-version` 支持

mise 支持 `.python-version`/`.python-versions` 文件。参阅[惯用版本文件](/configuration.html#idiomatic-version-files)。

## 自动激活虚拟环境

Python 内置了 virtualenv 支持，可以在 `mise.toml` 中使用如下配置：

```toml
[tools]
python = "3.11" # [可选] 将用于创建虚拟环境

[env]
_.python.venv = ".venv" # 相对于此文件所在目录
_.python.venv = "/root/.venv" # 可以是绝对路径
_.python.venv = "{{env.HOME}}/.cache/venv/myproj" # 可以使用模板
_.python.venv = { path = ".venv", create = true } # 如果虚拟环境不存在则创建
_.python.venv = { path = ".venv", create = true, python = "3.10" } # 使用指定的 python 版本
_.python.venv = {
  path = ".venv", create = true,
  python_create_args = ["--without-pip"], # 传递参数给 python -m venv
}
_.python.venv = {
  path = ".venv", create = true,
  uv_create_args = ["--system-site-packages"], # 传递参数给 uv venv
}
# 在虚拟环境中安装种子包（pip、setuptools 和 wheel）
_.python.venv = { path = ".venv", create = true, uv_create_args = ['--seed'] }
```

除非设置了 `create=true`，否则需要手动使用 `python -m venv /path/to/venv` 创建虚拟环境。
关于 `_.python.venv` 的更多信息请参阅[环境指令](https://mise.jdx.dev/environments/#env-directives)。

## mise 与 uv

如果你安装了 `uv`（例如通过 `mise use -g uv@latest`），`mise` 会使用它来创建虚拟环境。否则会使用内置的 `python -m venv` 命令。

注意 `uv` 默认不包含 `pip`（因为 `uv` 提供了 `uv pip` 来替代）。如果你需要 `pip` 包，请添加 `uv_create_args = ['--seed']` 选项。

如果你仍在使用旧版设置 `python.uv_venv_auto = true`（已弃用），mise 还会导出 `UV_PYTHON`，强制 `uv` 使用 `mise` 所选的 python 版本。

更多示例请参阅 [mise + uv 实践手册](/mise-cookbook/python.html#mise-uv)。

## 默认 Python 包

mise 可以在安装新 Python 版本后自动使用 pip 安装一组默认的 Python 包。要启用此功能，提供一个 `$HOME/.default-python-packages` 文件，每行列出一个包，例如：

```text
ansible
pipenv
```

你可以通过设置 `MISE_PYTHON_DEFAULT_PACKAGES_FILE` 变量来指定此文件的非默认位置。

## 预编译的 python 二进制文件

默认情况下，mise 会下载 [预编译二进制文件](https://github.com/astral-sh/python-build-standalone) 而不是使用 python-build 编译。这使得安装 python 快得多。

除了速度更快，这也意味着你不需要安装所有的系统依赖。

不过，预编译二进制文件有一些[已知问题](https://github.com/astral-sh/python-build-standalone/blob/main/docs/quirks.rst)需要注意。

如果你想禁用预编译二进制文件，设置 `mise settings python.compile=1`。

这些二进制文件可能不适用于较旧的 CPU，但你可以通过设置 `MISE_PYTHON_PRECOMPILED_ARCH` 为不同的值来选择与旧 CPU 更兼容的二进制文件。更多信息请参阅 <https://gregoryszorc.com/docs/python-build-standalone/main/running.html>。设为 "x86_64" 可获得最高兼容性的二进制文件。

## python-build

作为可选方案，mise 使用 [python-build](https://github.com/pyenv/pyenv/tree/master/plugins/python-build)（pyenv 的一部分）来编译 python 运行时，你需要确保在使用 python-build 安装 python 之前已安装其[依赖](https://github.com/pyenv/pyenv/wiki#suggested-build-environment)。

## 安装自由线程 python

自由线程（free-threaded）python 可以通过 python-build 安装：

```bash
MISE_PYTHON_COMPILE=0 MISE_PYTHON_PRECOMPILED_FLAVOR=freethreaded+pgo-full mise install python
```

或使用 python-build 编译：

```bash
MISE_PYTHON_COMPILE=1 PYTHON_BUILD_FREE_THREADING=1 mise install python
```

## Homebrew 相关错误排查

如果你通常使用 Homebrew 并遇到 OpenSSL 相关错误，最好的办法可能是使用以下命令安装 Python：

```sh
CFLAGS="-I$(brew --prefix openssl)/include" \
LDFLAGS="-L$(brew --prefix openssl)/lib" \
mise install python@latest;
```

Homebrew 安装自己的 OpenSSL 版本，可能与系统预期的版本冲突。你甚至可以将这些配置添加到 `.profile`、`.bashrc`、`.zshrc` 等文件中，以避免每次都要设置。

此外，如果你遇到 python-build 的问题，在安装前取消链接 pkg-config 可能有帮助（[原因](https://github.com/pyenv/pyenv/issues/2823#issuecomment-1769081965)）。

```sh
brew unlink pkg-config
mise install python@latest
brew link pkg-config
```

因此完整的脚本如下：

```sh
brew unlink pkg-config
CFLAGS="-I$(brew --prefix openssl)/include" \
  LDFLAGS="-L$(brew --prefix openssl)/lib" \
  mise install python@latest
brew link pkg-config
```

## 设置

`python-build` 已有一些[内置设置](https://github.com/pyenv/pyenv/tree/master/plugins/python-build)，此外 mise 中的 python 还有一些额外的配置变量。

通过 `mise settings set [VARIABLE] [VALUE]` 或设置对应的环境变量进行配置。

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="python" :level="3" />
