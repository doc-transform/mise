# Zig

`mise` 可用于在同一系统上安装和管理多个版本的 [zig](https://ziglang.org/)。

> 以下是使用 zig mise 核心插件的说明。

相关代码位于 mise 仓库的
[`./src/plugins/core/zig.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/zig.rs)。

## 用法

以下命令安装 zig 并将其设为全局默认版本：

```sh
mise use -g zig@0.14           # 安装 zig 0.14.x
mise use -g zig@latest         # 安装最新 zig 发布版
mise use -g zig@master         # 安装 master 分支的最新夜间构建
mise use -g zig@2024.11.0-mach # 安装 Mach 提名的 zig
mise use -g zig@mach-latest    # 安装最新 Mach 提名的 zig
```

使用 `mise ls-remote zig` 查看可用的稳定版本。

注意 [Mach](https://machengine.org/) 版本不会显示在 `mise ls-remote zig` 中，这是为了解决[版本排序 bug](https://github.com/jdx/mise/discussions/5232) 的变通方案。尽管如此，你仍然可以安装 [Mach 版本索引](https://machengine.org/zig/index.json)中列出的 Mach 版本。以下命令会列出可用的 Mach 版本：

```sh
curl https://machengine.org/zig/index.json | yq 'keys'
```

## zig 语言服务器

`zig` 语言服务器（[zls](https://github.com/zigtools/zls)）需要单独安装。
你可以使用 `mise` 安装：

```sh
mise use -g zls@0.14   # 安装 zls 0.14.x
mise use -g zls@latest # 安装最新 zls 发布版
```

注意 `zig` 的标记发布版本应搭配相同标记版本的 `zls` 使用。目前没有 Mach 版本的 `zls`。

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="zig" :level="3" />
