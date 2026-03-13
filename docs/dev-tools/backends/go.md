# Go 工具源

你可以通过 [go install](https://go.dev/doc/install) 直接安装包，即使没有对应的 asdf 插件也可以。

相关代码位于 mise 仓库的 [`./src/backend/go.rs`](https://github.com/jdx/mise/blob/main/src/backend/go.rs)。

## 依赖

需要先安装 `go`。你可以通过 mise 安装：

```sh
mise use -g go
```

::: tip
只要能安装 `go`，任何方式都可以。
mise 会使用 PATH 中的任何 `go`。
:::

## 用法

以下命令安装最新版本的 [hivemind](https://github.com/DarthSim/hivemind) 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g go:github.com/DarthSim/hivemind
$ hivemind --help
Hivemind version 1.1.0
```

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `go` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `tags`

指定 go 构建标签（作为 `go install --tags` 传递）：

```toml
[tools]
"go:github.com/golang-migrate/migrate/v4/cmd/migrate" = { version = "latest", tags = "postgres" }
```
