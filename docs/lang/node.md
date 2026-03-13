# Node

与 `nvm`（或 `volta`、`fnm`、`asdf`...）类似，`mise` 可以在同一系统上管理多个版本的 Node.js。

> 以下是使用 node mise 核心插件的说明。当没有安装名为 "node" 的 git 插件时会使用核心插件。
> 如果你想使用 [asdf-nodejs](https://github.com/asdf-vm/asdf-nodejs)，请运行 `mise plugins install node https://github.com/asdf-vm/asdf-nodejs`

相关代码位于 mise 仓库的 [`./src/plugins/core/node.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/node.rs)。

## 用法

以下命令安装最新版本的 node-20.x 并将其设为全局默认版本：

```sh
mise use -g node@20
```

更多常见任务和示例请参阅 [Node.JS 实践手册](/mise-cookbook/nodejs.html)。

## `.nvmrc` 和 `.node-version` 支持

默认情况下，mise 使用 `mise.toml` 文件在不同软件版本之间自动切换。

它也支持 `.tool-versions`、`.nvmrc` 或 `.node-version` 文件来确定应使用哪个版本的 Node.js。如果 `mise.toml` 中没有定义 `node`，就会使用这些文件。

这使得它可以直接替代 `nvm`。更多信息请参阅[惯用版本文件](/configuration.html#idiomatic-version-files)。

## 默认 node 包

mise-node 可以在安装新 node 版本后自动安装一组默认的 npm 包。要启用此功能，提供一个 `$HOME/.default-npm-packages` 文件，每行列出一个包，例如：

```text
lodash
request
express
```

你可以通过设置 `MISE_NODE_DEFAULT_PACKAGES_FILE` 变量来指定此文件的非默认位置。

## "nodejs" -> "node" 别名

你无法安装/使用名为 "nodejs" 的插件。如果你尝试这样做，mise 会自动将其重命名为 "node"。请参阅 [FAQ](/faq.html#what-is-the-difference-between-nodejs-and-node-or-golang-and-go) 了解原因。

## 从源码构建

如果要从源码编译，请参阅 node 文档中的 [BUILDING.md](https://github.com/nodejs/node/blob/main/BUILDING.md#building-nodejs-on-supported-platforms) 了解所需的系统依赖。

```shell
mise settings node.compile=1
mise use node@latest
```

## 非官方构建

Nodejs.org 提供了一套[非官方构建](https://unofficial-builds.nodejs.org/)，兼容一些官方二进制文件不支持的平台。对于这些平台，这是从源码编译的一个不错的替代方案。

要使用非官方构建，首先将镜像 URL 指向非官方构建：

```sh
mise settings node.mirror_url=https://unofficial-builds.nodejs.org/download/release/
```

如果你的目标只是支持替代架构/操作系统，如 linux-loong64 或 linux-armv6l，这就是所需的全部配置。Node 还提供 musl 或 glibc-217（比官方二进制文件使用的更旧的 glibc 版本）等风味。

要使用这些风味，设置 `node.flavor`：

```sh
mise settings node.flavor=musl
mise settings node.flavor=glibc-217
```

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="node" :level="3" />
