# Erlang

`mise` 可用于在同一系统上安装和管理多个版本的 [erlang](https://www.erlang.org/)。

> 以下是使用 erlang 核心插件的说明。
> 当没有安装名为 "erlang" 的 git 插件时会使用核心插件。

相关代码位于 mise 仓库的
[`./src/plugins/core/erlang.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/erlang.rs)。

## 用法

以下命令安装 erlang 并将其设为全局默认版本：

```sh
mise use -g erlang@26
```

使用 `mise ls-remote erlang` 查看可用版本。

## kerl

该插件底层使用 [kerl](https://github.com/kerl/kerl) 来构建 erlang。
有关 kerl 的配置信息，请参阅 kerl 的文档。

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="erlang" :level="3" />
