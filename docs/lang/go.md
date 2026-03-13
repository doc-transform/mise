# Go

`mise` 可用于在同一系统上安装和管理多个版本的 [go](https://golang.org/)。

> 以下是使用 go mise 核心插件的说明。当没有安装名为 "go" 的 git 插件时会使用核心插件。如果你想使用 [asdf-golang](https://github.com/kennyp/asdf-golang)，请使用 `mise plugins install go GIT_URL`。

相关代码位于 mise 仓库的
[`./src/plugins/core/go.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/go.rs)。

## 用法

以下命令安装最新版本的 go-1.21.x（如果尚未安装 1.21.x 的某个版本）并将其设为全局默认版本：

```sh
mise use -g go@1.21
```

1.20 及以下的次版本需要在版本号前指定 `prefix`，因为每个系列的第一个版本发布时不带 `.0` 后缀，导致 1.20 会被当作精确版本匹配：

```sh
mise use -g go@prefix:1.20
```

## `.go-version` 文件支持

mise 使用 `mise.toml` 或 `.tool-versions` 文件在不同软件版本之间自动切换。
不过，它也可以读取 go 专用的版本文件 `.go-version`。

参阅[惯用版本文件](/configuration.html#idiomatic-version-files)

## 默认包

mise 可以在安装新的 go 版本后自动安装一组默认包。
要启用此功能，提供一个 `$HOME/.default-go-packages` 文件，每行列出一个包，例如：

```text
github.com/daixiang0/gci # 支持注释
github.com/jesseduffield/lazygit
```

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="go" :level="3" />
