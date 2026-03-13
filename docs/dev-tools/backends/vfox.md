# Vfox 工具源

::: tip
Vfox 是 mise 推荐的插件系统。它提供跨平台支持、内置模块和现代的基于钩子的架构。
:::

[Vfox](https://github.com/version-fox/vfox) 插件可以在 mise 中用于安装工具。

## 为什么选择 vfox？

- **跨平台** — 插件在 Windows、macOS 和 Linux 上都能工作，无需编写特定平台的代码
- **内置模块** — HTTP、JSON、HTML 解析、归档文件解压、semver 比较和日志等功能开箱即用，无需外部依赖
- **安全** — 支持下载构件的证明验证（cosign 签名、SLSA 来源证明）
- **现代架构** — 带类型化上下文的结构化钩子、用于多工具管理的工具源插件、滚动版本校验和以及 lock 文件支持

相关代码位于 mise 仓库的 [`./src/backend/vfox.rs`](https://github.com/jdx/mise/blob/main/src/backend/vfox.rs)。

## 依赖

vfox 无需任何依赖。Vfox 的 Lua 代码通过 mise 内置的 Lua 解释器读取。

## 用法

以下命令安装最新版本的 cmake 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g vfox:version-fox/vfox-cmake
$ cmake --version
cmake version 3.21.3
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"vfox:version-fox/vfox-cmake" = "latest"
```

## 默认插件工具源

在 Windows 上，mise 默认使用 vfox 插件。
如果你想在 Linux/macOS 上也默认使用插件，请设置以下选项：

```sh
mise settings add disable_backends asdf
```

现在你可以使用 `mise registry` 列出可用的插件：

```sh
$ mise registry | grep vfox:
clang                         vfox:mise-plugins/vfox-clang
cmake                         vfox:mise-plugins/vfox-cmake
crystal                       vfox:mise-plugins/vfox-crystal
dart                          vfox:mise-plugins/vfox-dart
dotnet                        vfox:mise-plugins/vfox-dotnet
etcd                          aqua:etcd-io/etcd vfox:mise-plugins/vfox-etcd
flutter                       vfox:mise-plugins/vfox-flutter
gradle                        aqua:gradle/gradle vfox:mise-plugins/vfox-gradle
groovy                        vfox:mise-plugins/vfox-groovy
kotlin                        vfox:mise-plugins/vfox-kotlin
maven                         aqua:apache/maven vfox:mise-plugins/vfox-maven
php                           vfox:mise-plugins/vfox-php
scala                         vfox:mise-plugins/vfox-scala
terraform                     aqua:hashicorp/terraform vfox:mise-plugins/vfox-terraform
vlang                         vfox:mise-plugins/vfox-vlang
```

这样在运行 `mise use -g cmake` 等命令时会自动安装对应的插件，无需指定 `vfox:cmake`。

## 插件

除了标准的 vfox 插件外，mise 还支持现代插件，可以使用 `plugin:tool` 格式管理多个工具。这些插件非常适合：

- 从私有仓库安装工具
- 包管理器（npm、pip 等）
- 自定义工具系列

### 示例：插件用法

```bash
# 安装插件
mise plugin install my-plugin https://github.com/username/my-plugin

# 使用 plugin:tool 格式
mise install my-plugin:some-tool@1.0.0
mise use my-plugin:some-tool@latest
```

### 从 Zip 文件安装

```bash
# 通过 HTTPS 从 zip 文件安装插件
mise plugin install <plugin-name> <zip-url>
# 示例：从 zip 文件安装插件
mise plugin install vfox-cmake https://github.com/mise-plugins/vfox-cmake/archive/refs/heads/main.zip
```

更多信息请参阅：

- [使用插件](../../plugin-usage.md) - 最终用户指南
- [插件开发](../../tool-plugin-development.md) - 开发者指南
- [插件模板](https://github.com/jdx/mise-tool-plugin-template) - 创建插件的快速入门模板
