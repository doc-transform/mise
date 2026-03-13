# Model Context Protocol (MCP)

Model Context Protocol（MCP）是一种标准协议，使 AI 助手能够与开发工具交互并访问项目上下文。mise 提供了一个 MCP 服务器，允许 AI 助手查询你的开发环境信息。

## 概述

运行 `mise mcp` 时，它会启动一个服务器，AI 助手可以连接并查询你的 mise 管理的开发环境信息。服务器通过 stdin/stdout 使用 JSON-RPC 协议进行通信。

::: warning
MCP 功能目前处于实验阶段，需要通过 `MISE_EXPERIMENTAL=1` 启用实验性功能。
:::

## 使用方式

MCP 服务器通常由 AI 助手自动启动，但你也可以手动运行用于测试：

```bash
# 启用实验性功能
export MISE_EXPERIMENTAL=1

# 启动 MCP 服务器（它会在 stdin 上等待 JSON-RPC 输入）
mise mcp
```

## 可用资源

MCP 服务器暴露以下只读资源供 AI 助手查询：

### `mise://tools`

列出项目中由 mise 管理的所有工具，包括：

- 工具名称和版本
- 安装状态
- 配置来源

### `mise://tasks`

显示所有可用的 mise 任务，包括：

- 任务名称和描述
- 任务依赖
- 命令定义

### `mise://env`

显示 mise 配置中定义的环境变量：

- 变量名称和值
- 环境特定的覆盖配置

### `mise://config`

提供 mise 配置相关信息：

- 活动的配置文件
- 项目根目录
- 设置和偏好

## 可用工具

以下工具可供 AI 助手调用：

### `install_tool`

安装指定的工具版本（尚未实现）

### `run_task`

执行 mise 任务，可传入可选参数。

**参数：**

- `task`（必填，字符串）：要运行的任务名称
- `args`（可选，字符串数组）：传递给任务的参数

**示例：**

```json
{
  "task": "build",
  "args": ["--verbose"]
}
```

当 AI 助手调用此工具时，它会执行指定的任务并返回输出，包括 stdout、stderr 和退出状态。

## 与 AI 助手集成

### Claude Desktop

要在 Claude Desktop 中使用 mise，将以下内容添加到 Claude 配置文件中：

**macOS**：`~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**：`%APPDATA%\Claude\claude_desktop_config.json`
**Linux**：`~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mise": {
      "command": "mise",
      "args": ["mcp"],
      "env": {
        "MISE_EXPERIMENTAL": "1"
      }
    }
  }
}
```

添加此配置并重启 Claude Desktop 后，助手将能够：

- 查询你已安装的工具和版本
- 列出项目中的可用任务
- 直接执行任务（如"运行构建任务"）
- 访问 mise 配置中的环境变量
- 查看你的 mise 配置结构

### 其他 AI 助手

MCP 服务器使用标准的 JSON-RPC 2.0 over stdio，兼容任何支持 Model Context Protocol 的 AI 助手。请查阅你的 AI 助手文档了解具体集成方式。

## 使用示例

与 AI 助手集成后，你可以提出以下问题：

- "这个项目使用的是什么版本的 Node.js？"
- "列出这个项目中所有可用的任务"
- "运行构建任务"
- "用详细输出执行测试任务"
- "mise 设置了哪些环境变量？"
- "显示这个项目的 mise 配置"

AI 助手会查询 MCP 服务器来提供准确、最新的开发环境信息，并可以代你执行任务。

## 技术细节

MCP 服务器的实现代码位于 [`src/cli/mcp.rs`](https://github.com/jdx/mise/blob/main/src/cli/mcp.rs)。它实现了 rmcp crate 中的 ServerHandler trait，用于处理：

- 资源列出和读取
- 工具调用（任务执行）
- 通过 stdio 的 JSON-RPC 通信

更多关于 Model Context Protocol 的信息，请访问 [MCP 官方文档](https://modelcontextprotocol.io/)。
