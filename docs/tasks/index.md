# 任务

> 类似 [make](https://www.gnu.org/software/make/manual/make.html)，mise 可以管理用于构建和测试项目的_任务_。

你可以在 `mise.toml` 文件中定义任务，也可以将其定义为独立的 shell 脚本。这对于运行代码检查、测试、构建、启动服务器等项目特定操作非常有用。当然，通过 mise 启动的任务会包含 mise 环境——即你在 `mise.toml` 中定义的工具和环境变量。

以下是 mise 任务运行器中我最喜欢的特性：

- 默认并行构建依赖——无需额外配置
- 基于最后修改时间检查，避免无变更时重复构建——只需少量配置
- [mise watch](./running-tasks.html#watching-files) 自动监听文件变化并重新构建——无需配置，但配置后效果更好
- 可以将任务编写为真正的 bash 脚本文件，而不是嵌入 yml/json/toml 字符串中（那样缺乏语法高亮和代码检查支持）

定义任务有两种方式：[在 `mise.toml` 文件中](./toml-tasks.html) 或 [作为独立 shell 脚本](./file-tasks.html)。你还可以使用[任务模板](./templates.html)来创建可复用的任务定义。

## `mise.toml` 中的任务

任务定义在 `mise.toml` 文件的 `[tasks]` 部分。

```toml [mise.toml]
[tasks.build]
description = "Build the CLI"
run = "cargo build"
```

然后你可以用 `mise run build`（或 `mise build`，前提是不与已有命令冲突）来运行任务。

- 参阅 [TOML 任务](./toml-tasks.html)了解更多信息。
- 参阅[运行任务](./running-tasks.html)了解如何运行任务。

## 文件任务

你也可以将任务定义为独立的 shell 脚本。只需在特定目录（如 `mise-tasks`）中创建一个`可执行`文件即可。

```sh [mise-tasks/build]
#!/usr/bin/env bash
#MISE description="Build the CLI"
cargo build
```

然后你可以像 TOML 任务一样用 `mise run build` 来运行。
参阅[文件任务参考](./file-tasks.html)了解更多信息。

## 传递给任务的环境变量

以下环境变量会传递给任务：

- `MISE_ORIGINAL_CWD`：运行任务时的原始工作目录。
- `MISE_CONFIG_ROOT`：包含定义该任务的 `mise.toml` 文件的目录，或者如果配置路径类似 `~/src/myproj/.config/mise.toml`，则为 `~/src/myproj`。
- `MISE_PROJECT_ROOT`：项目的根目录。
- `MISE_TASK_NAME`：正在运行的任务名称。
- `MISE_TASK_DIR`：包含任务脚本的目录。
- `MISE_TASK_FILE`：任务脚本的完整路径。
