# Dotnet 工具源

相关代码位于 mise 仓库的 [`./src/backend/dotnet.rs`](https://github.com/jdx/mise/blob/main/src/backend/dotnet.rs)。

::: tip 重要
dotnet 工具源需要安装 .NET 运行时。你可以使用 mise 安装：

```sh
# 安装最新版本
mise use dotnet

# 或安装特定版本（8、9 等）
mise use dotnet@8
mise use dotnet@9
```

这将安装 .NET 运行时，dotnet 工具需要它才能正常工作。
:::

## 用法

以下命令安装最新版本的 [GitVersion.Tool](https://gitversion.net/) 并将其设为 PATH 中的活跃版本：

```sh
$ mise use dotnet:GitVersion.Tool@5.12.0
$ dotnet-gitversion /version
5.12.0+Branch.support-5.x.Sha.3f75764963eb3d7956dcd5a40488c074dd9faf9e
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"dotnet:GitVersion.Tool" = "5.12.0"
```

```sh
$ mise use dotnet:GitVersion.Tool
$ dotnet-gitversion /version
6.1.0+Branch.main.Sha.8856e3041dbb768118a55a31ad4e465ae70c6767
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"dotnet:GitVersion.Tool" = "latest"
```

### 支持的 Dotnet 语法

| 描述                          | 用法                            |
| ----------------------------- | ------------------------------- |
| Dotnet 简写（最新版本）       | `dotnet:GitVersion.Tool`        |
| Dotnet 简写（指定版本）       | `dotnet:GitVersion.Tool@5.12.0` |

## 设置

通过 `mise settings set [VARIABLE] [VALUE]` 或设置对应的环境变量进行配置。

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="dotnet" :level="3" />

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `dotnet` 工具源——在 `mise.toml` 的 `[tools]` 中配置。
