# Elixir

`mise` 可用于在同一系统上管理多个 [`elixir`](https://elixir-lang.org/) 版本。

> 以下是使用 elixir 核心插件的说明。当没有安装名为 "elixir" 的 git 插件时会使用核心插件。

相关代码位于 mise 仓库的
[`./src/plugins/core/elixir.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/elixir.rs)。

## 用法

使用最新稳定版的 elixir：

```sh
mise use -g erlang elixir
```

注意安装 `elixir` 需要先安装 [`erlang`](/lang/erlang.html)。
