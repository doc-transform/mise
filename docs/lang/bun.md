# Bun

`mise` 可用于在同一系统上安装和管理多个版本的 [bun](https://bun.sh/)。

> 以下是使用 bun mise 核心插件的说明。当没有安装名为 "bun" 的 git 插件时会使用核心插件。

相关代码位于 mise 仓库的
[`./src/plugins/core/bun.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/bun.rs)。

## 用法

以下命令安装 bun 并将其设为全局默认版本：

```sh
mise use -g bun@0.7     # 安装 bun 0.7.x
mise use -g bun@latest  # 安装最新版 bun
```

使用 `mise ls-remote bun` 查看可用版本。

> [!NOTE]
> 避免使用 `bun upgrade` 来升级 bun，因为 `mise` 无法感知这种方式的变更。
