# Deno

`mise` 可用于在同一系统上安装和管理多个版本的 [deno](https://deno.land/)。

> 以下是使用 deno mise 核心插件的说明。当没有安装名为 "deno" 的 git 插件时会使用核心插件。如果你想使用 [asdf-deno](https://github.com/asdf-community/asdf-deno)，请运行 `mise plugins install deno https://github.com/asdf-community/asdf-deno`。

相关代码位于 mise 仓库的
[`./src/plugins/core/deno.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/deno.rs)。

## 用法

以下命令安装 deno 并将其设为全局默认版本：

```sh
mise use -g deno@1       # 安装 deno 1.x
mise use -g deno@latest  # 安装最新版 deno
```

使用 `mise ls-remote deno` 查看可用版本。

> [!NOTE]
> 避免使用 `deno upgrade` 来升级 `deno`，因为 `mise` 无法感知这种方式的变更。
