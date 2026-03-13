---
editLink: false
---

# 注册表

<script setup>
import Registry from '/components/registry.vue';
</script>

`mise` 中所有默认别名的[工具](#tools)列表。

你可以在 `mise use` 中使用这些简写名称。这样你就可以在不需要知道完整名称的情况下使用工具。例如，要使用 `aws-cli` 工具，你可以这样做：

```shell
mise use aws-cli
```

而不是

```shell
mise use aqua:aws/aws-cli
```

如果某个工具不在注册表中，你可以通过完整名称来安装。[github](./dev-tools/backends/github.html) 和 [aqua](./dev-tools/backends/aqua.html) 让你可以访问 GitHub 上几乎所有的程序。

## 工具源

除了内置的[核心工具](/core-tools.html)外，`mise` 支持多种[工具源](/dev-tools/backends/)来安装工具。

一般来说，新工具推荐使用以下[工具源](/dev-tools/backends/)（按优先级排序）：

- [aqua](./dev-tools/backends/aqua.html) - 提供最多的功能和安全特性，且无需插件
- [github](./dev-tools/backends/github.html) - 适用于 aqua 注册表中没有但在 GitHub 上可用的工具
- [gitlab](./dev-tools/backends/gitlab.html) - 适用于 aqua 注册表中没有但在 GitLab 上可用的工具
- [pipx](./dev-tools/backends/pipx.html) - 仅适用于 Python 工具，需要安装 python，但使用 Python 工具时通常都会有
- [npm](./dev-tools/backends/npm.html) - 仅适用于 Node 工具，需要安装 node，但使用 Node 工具时通常都会有
- [go](./dev-tools/backends/go.html) - 仅适用于 Go 工具，需要安装 go 来编译。由于 Go 工具可以分发为单个二进制文件，aqua/github 是更好的选择
- [cargo](./dev-tools/backends/cargo.html) - 仅适用于 Rust 工具，需要安装 rust 来编译。由于 Rust 工具可以分发为单个二进制文件，aqua/github 是更好的选择
- [dotnet](./dev-tools/backends/dotnet.html) - 仅适用于 dotnet 工具，需要安装 dotnet 来编译。由于 dotnet 工具可以分发为单个二进制文件，aqua/github 是更好的选择

出于供应链安全原因，新的 vfox 和 asdf 工具几乎不会被接受。

### 工具源优先级

每个工具如果支持多个工具源，可以定义自己的优先级。如果你想禁用某个工具源，可以使用以下命令：

```shell
mise settings disable_backends=asdf
```

这将禁用 [asdf](./dev-tools/backends/asdf.html) 工具源。参见[别名](/dev-tools/aliases.html)了解如何为工具设置默认工具源。请注意，在 Windows 上 `asdf` 工具源默认被禁用。

你也可以使用 `mise use aqua:1password/cli` 这样的完整名称来指定使用特定的工具源。

### 环境变量覆盖

你可以使用 `MISE_BACKENDS_<TOOL>` 模式的环境变量来覆盖任何工具的工具源。这具有最高优先级，会覆盖注册表或别名配置：

```shell
# 使用 vfox 工具源安装 php
export MISE_BACKENDS_PHP='vfox:mise-plugins/vfox-php'
mise install php@latest
```

环境变量中的工具名称应使用 SHOUTY_SNAKE_CASE（全大写加下划线）。例如，`my-tool` 变为 `MISE_BACKENDS_MY_TOOL`。

来源：<https://github.com/jdx/mise/blob/main/registry/>

## 工具 {#tools}

注意 [`mise registry`](/cli/registry.html) 可用于列出注册表中的所有工具。不带参数运行 [`mise use`](/cli/use.html) 会显示一个 `tui` 供你选择要安装的工具。

<Registry />
