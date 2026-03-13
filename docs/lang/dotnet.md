# .NET

.NET 核心插件使用 Microsoft 官方安装脚本安装 .NET SDK。所有 SDK 版本并排安装在共享的 `DOTNET_ROOT` 目录下，与 .NET 原生的多版本模型一致。这意味着 `dotnet --list-sdks` 会显示你通过 mise 安装的所有版本。

与大多数工具不同，SDK 不在 `~/.local/share/mise/installs` 中，因为它们共享一个公共根目录。mise 会将安装路径符号链接到 `DOTNET_ROOT` 并设置环境变量，以便正确的 SDK 被识别。

::: info
此插件管理的是 **.NET SDK** 本身。要安装 .NET 全局工具（如 `dotnet-ef`），请使用 [`dotnet` 工具源](/dev-tools/backends/dotnet.html)的 `dotnet:ToolName` 语法。
:::

## 用法

使用最新的 .NET SDK：

```sh
mise use -g dotnet@latest
dotnet --version
```

使用特定版本：

```sh
mise use -g dotnet@8.0.400
dotnet --version
```

并排安装多个 SDK 以支持多目标框架：

```sh
mise use dotnet@8
mise use dotnet@9
dotnet --list-sdks
```

## `global.json` 支持

mise 将 `global.json` 识别为惯用版本文件。如果你的项目包含指定了 SDK 版本的 `global.json`，mise 会自动使用它：

```json
{
  "sdk": {
    "version": "8.0.100"
  }
}
```

启用 dotnet 的惯用版本文件支持：

```sh
mise settings set idiomatic_version_file_enable_tools dotnet
```

## 隔离模式

默认情况下，所有 SDK 版本共享单个 `DOTNET_ROOT` 目录。这与 .NET 原生的并排安装模型一致，意味着 `dotnet --list-sdks` 会显示所有已安装的版本。

如果你更喜欢传统的 mise 方式，即每个版本有自己的目录，可以启用隔离模式：

```sh
mise settings set dotnet.isolated true
```

在隔离模式下，每个 SDK 版本安装在 `~/.local/share/mise/installs/dotnet/<version>/` 下，与大多数其他 mise 管理的工具一样。`dotnet --list-sdks` 只会报告当前活跃的版本。

|                      | 共享模式（默认）       | 隔离模式                       |
| -------------------- | ---------------------- | ------------------------------ |
| `dotnet --list-sdks` | 所有已安装版本         | 仅活跃版本                     |
| 安装位置             | `DOTNET_ROOT`          | `installs/dotnet/<version>/`   |
| 多目标框架           | 开箱即用               | 需要切换版本                   |

## 环境变量

该插件设置以下环境变量：

| 变量                          | 值                                                         |
| ----------------------------- | ---------------------------------------------------------- |
| `DOTNET_ROOT`                 | 共享 SDK 安装目录（隔离模式下为安装路径）                  |
| `DOTNET_MULTILEVEL_LOOKUP`    | `0`                                                        |
| `DOTNET_CLI_TELEMETRY_OPTOUT` | 仅在配置了 `dotnet.cli_telemetry_optout` 时设置            |

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="dotnet" :level="3" />
