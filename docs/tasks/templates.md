# 任务模板

:::: warning
此功能为实验性功能，需要在设置中启用 `experimental = true`。
::::

任务模板允许你定义可被多个任务扩展的可复用任务定义。在 monorepo 或多个组件具有相似任务模式的项目中特别有用。

## 定义模板

模板定义在 `mise.toml` 的 `[task_templates.*]` 部分：

```toml
[settings]
experimental = true

[task_templates."python:build"]
description = "Build a Python project"
run = "uv build"
tools = { python = "3.12", uv = "latest" }
env = { PYTHONPATH = "src" }

[task_templates."python:test"]
description = "Run Python tests"
run = "pytest"
tools = { python = "3.12" }
depends = ["build"]
```

## 扩展模板

任务通过 `extends` 字段扩展模板：

```toml
[tasks.build]
extends = "python:build"

[tasks.test]
extends = "python:test"
run = "pytest --cov"  # 覆盖 run，保留 tools、depends
```

## 模板命名

模板使用冒号（`:`）分隔符进行命名空间划分，类似 monorepo 中的任务命名约定：

- `python:build`
- `python:test`
- `rust:cargo:build`
- `node:npm:test`

## 合并语义

当任务扩展模板时，字段按以下规则合并：

| 字段                                     | 行为                                               |
| --------------------------------------- | -------------------------------------------------- |
| `run`, `run_windows`                    | 本地完全覆盖                                         |
| `tools`                                 | 深度合并（本地工具添加/覆盖模板）                       |
| `env`                                   | 深度合并（本地环境变量添加/覆盖模板）                    |
| `depends`, `depends_post`, `wait_for`   | 本地完全覆盖（不合并）                                 |
| `dir`                                   | 本地覆盖；模板中未设置则默认为 config_root               |
| `sources`, `outputs`                    | 本地完全覆盖                                         |
| `description`, `shell`, `timeout` 等     | 本地覆盖模板（如果设置了）                              |
| `quiet`, `hide`, `raw`                  | 不继承（必须在任务中明确设置）                           |

### 示例：tools 的深度合并

```toml
[task_templates."fullstack:build"]
tools = { python = "3.12", node = "18" }

[tasks.build]
extends = "fullstack:build"
tools = { node = "20" }  # 覆盖 node，保留模板中的 python
# 结果: tools = { python = "3.12", node = "20" }
```

### 示例：env 的深度合并

```toml
[task_templates."python:build"]
env = { PYTHONPATH = "src", DEBUG = "0" }

[tasks.build]
extends = "python:build"
env = { DEBUG = "1" }  # 覆盖 DEBUG，保留模板中的 PYTHONPATH
# 结果: env = { PYTHONPATH = "src", DEBUG = "1" }
```

### 示例：depends 的完全覆盖

```toml
[task_templates."python:test"]
depends = ["lint", "typecheck"]

[tasks.test]
extends = "python:test"
depends = ["build"]  # 完全替换模板的 depends
# 结果: depends = ["build"]（lint 和 typecheck 不包含）
```

## Tera 模板

模板支持 Tera 模板，使用**使用项目的上下文**渲染：

```toml
[task_templates."python:build"]
description = "Build Python project"
dir = "{{ config_root }}"  # 解析为项目的目录（不是模板定义的位置）
run = "uv build"
env = { PROJECT = "{{ config_root | basename }}" }
```

可用变量（与普通任务相同）：

- <code v-pre>{{ config_root }}</code> - 使用模板的项目（不是模板定义的位置）
- <code v-pre>{{ env.VAR }}</code> - 环境变量
- <code v-pre>{{ cwd }}</code> - 当前工作目录
- <code v-pre>{{ vars.* }}</code> - 配置中用户定义的变量

## Monorepo 用法

任务模板在 monorepo 中特别有用，多个包共享相似的构建模式：

```toml
# 根 mise.toml
[settings]
experimental = true
experimental_monorepo_root = true

[task_templates."python:build"]
run = "uv build"
tools = { python = "3.12", uv = "latest" }

[task_templates."python:test"]
run = "pytest"
tools = { python = "3.12" }
depends = ["build"]

[task_templates."python:lint"]
run = "ruff check ."
tools = { python = "3.12", ruff = "latest" }
```

```toml
# packages/api/mise.toml
[tasks.build]
extends = "python:build"

[tasks.test]
extends = "python:test"
run = "pytest --cov"  # 添加覆盖率

[tasks.lint]
extends = "python:lint"
```

```toml
# packages/worker/mise.toml
[tasks.build]
extends = "python:build"

[tasks.test]
extends = "python:test"

[tasks.lint]
extends = "python:lint"
```

## 未来增强

以下功能计划在未来版本中实现：

- **全局模板**：在 `~/.config/mise/config.toml` 中定义模板，跨所有项目使用
- **模板包**：从外部来源导入模板
- **模式匹配规则**：基于文件检测自动应用模板（例如，检测到 `pyproject.toml` 时自动应用 `python:*` 模板）
- **文件任务模板**：将模板定义为独立脚本文件，类似[文件任务](/tasks/file-tasks)
