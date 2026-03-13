# npm 工具源

你可以直接从 [npmjs.org](https://npmjs.org/) 安装包，即使没有对应的 asdf 插件也可以。

相关代码位于 mise 仓库的 [`./src/backend/npm.rs`](https://github.com/jdx/mise/blob/main/src/backend/npm.rs)。

## 依赖

需要安装 `npm` 来解析包版本。
如果你使用 `bun` 或 `pnpm` 作为包管理器，它们也需要先安装。

以下是通过 mise 安装 `npm` 的方式：

```sh
mise use -g node
```

安装 `bun` 或 `pnpm`：

```sh
mise use -g bun
# 或者
mise use -g pnpm
```

## 用法

以下命令安装最新版本的 [prettier](https://www.npmjs.com/package/prettier) 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g npm:prettier
$ prettier --version
3.1.0
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"npm:prettier" = "latest"
```

## 设置

通过 `mise settings set [VARIABLE] [VALUE]` 或设置对应的环境变量进行配置。

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="npm" :level="3" />
