# 预安装 <Badge type="warning" text="实验性" />

`mise prepare` 命令通过检查锁文件是否比安装输出（如 `package-lock.json` 与 `node_modules/` 的比较）更新来确保项目依赖就绪，并在需要时运行安装命令。

## 快速开始

```bash
# 启用实验性功能
export MISE_EXPERIMENTAL=1

# 运行所有适用的预安装步骤
mise prepare

# 或使用别名
mise prep
```

## 配置

在 `mise.toml` 中配置预安装提供者：

```toml
# 内置 npm 提供者（自动检测锁文件）
[prepare.npm]
auto = true  # 在 mise x/run 之前自动运行

# 其他包管理器的内置提供者
[prepare.yarn]
[prepare.pnpm]
[prepare.bun]
[prepare.go]
[prepare.pip]
[prepare.poetry]
[prepare.uv]
[prepare.bundler]
[prepare.composer]

# 自定义提供者
[prepare.codegen]
auto = true
sources = ["schema/*.graphql"]
outputs = ["src/generated/"]
run = "npm run codegen"

# 禁用特定提供者
[prepare]
disable = ["npm"]
```

## 内置提供者

mise 为常见包管理器内置了提供者：

| 提供者     | 源文件                                  | 输出目录              | 命令                                 |
| ---------- | --------------------------------------- | --------------------- | ------------------------------------ |
| `npm`      | `package.json`, `package-lock.json`     | `node_modules/`       | `npm install`                        |
| `yarn`     | `package.json`, `yarn.lock`             | `node_modules/`       | `yarn install`                       |
| `pnpm`     | `package.json`, `pnpm-lock.yaml`        | `node_modules/`       | `pnpm install`                       |
| `bun`      | `package.json`, `bun.lock`, `bun.lockb` | `node_modules/`       | `bun install`                        |
| `go`       | `go.mod`                                | `vendor/` 或 `go.sum` | `go mod vendor` 或 `go mod download` |
| `pip`      | `requirements.txt`                      | `.venv/`              | `pip install -r requirements.txt`    |
| `poetry`   | `pyproject.toml`, `poetry.lock`         | `.venv/`              | `poetry install`                     |
| `uv`       | `pyproject.toml`, `uv.lock`             | `.venv/`              | `uv sync`                            |
| `bundler`  | `Gemfile`, `Gemfile.lock`               | `vendor/bundle/`      | `bundle install`                     |
| `composer` | `composer.json`, `composer.lock`        | `vendor/`             | `composer install`                   |

内置提供者只在 `mise.toml` 中显式配置且锁文件存在时才生效。

## 自定义提供者

为项目特定的构建步骤创建自定义提供者：

```toml
[prepare.codegen]
sources = ["schema/*.graphql", "codegen.yml"]
outputs = ["src/generated/"]
run = "npm run codegen"
description = "Generate GraphQL types"

[prepare.prisma]
sources = ["prisma/schema.prisma"]
outputs = ["node_modules/.prisma/"]
run = "npx prisma generate"
```

### 提供者选项

| 选项            | 类型     | 说明                                                                    |
| --------------- | -------- | ----------------------------------------------------------------------- |
| `auto`          | bool     | 在 `mise x` 和 `mise run` 之前自动运行（默认：false）                   |
| `sources`       | string[] | 需要检查变更的文件/模式                                                  |
| `outputs`       | string[] | 应比源文件更新的文件/目录                                                |
| `run`           | string   | 过期时运行的命令                                                         |
| `env`           | table    | 要设置的环境变量                                                         |
| `dir`           | string   | 命令的工作目录                                                           |
| `description`   | string   | 在输出中显示的描述                                                       |
| `touch_outputs` | bool     | 成功运行后更新输出的修改时间使其显示为最新（默认：true）                  |

## 新旧检查

mise 使用修改时间（mtime）比较来判断输出是否过期：

1. 找到所有源文件中最新的 mtime
2. 找到所有输出文件中最新的 mtime
3. 如果任何源文件比所有输出文件更新，则该提供者为过期状态

这意味着：

- 如果修改了 `package-lock.json`，`node_modules/` 将被视为过期
- 如果 `node_modules/` 不存在，提供者始终为过期状态
- 如果源文件不存在，提供者被视为最新（无需操作）

成功运行后，mise 会将每个输出的 mtime 更新为当前时间（由 `touch_outputs` 控制，默认 `true`）。这确保了当依赖已满足时命令实际是空操作（如 `uv sync`）的情况下，输出仍被标记为最新，避免后续调用中重复的过期警告。

## 自动预安装

当提供者设置 `auto = true` 时，它会在以下命令之前自动运行：

- `mise run`（任务执行）
- `mise x`（exec 命令）

这确保在运行任务或命令之前依赖始终是最新的。

要在单次调用中跳过自动预安装：

```bash
mise run --no-prepare build
mise x --no-prepare -- npm test
```

## 过期警告

使用 `mise activate` 时，如果启用了自动运行的提供者有过期依赖，mise 会发出警告：

```
mise WARN prepare: npm may need update, run `mise prep`
```

可以通过以下方式禁用：

```toml
[settings]
status.show_prepare_stale = false
```

## CLI 用法

```bash
# 运行所有适用的预安装步骤
mise prepare

# 显示将要运行的内容但不执行
mise prepare --dry-run

# 即使输出是最新的也强制运行
mise prepare --force

# 列出可用的预安装提供者
mise prepare --list

# 仅运行特定提供者
mise prepare --only npm --only codegen

# 跳过特定提供者
mise prepare --skip npm
```

## 并行执行

预安装提供者并行运行，遵循 `jobs` 设置的并发限制。当多个提供者需要运行时（如同时需要 npm 和 pip），这可以加速准备过程。

```toml
[settings]
jobs = 4  # 最多并行运行 4 个提供者
```

## 示例：全栈项目

```toml
# 包含 Node.js 前端和 Python 后端的项目的 mise.toml

[prepare.npm]
auto = true

[prepare.poetry]
auto = true

[prepare.prisma]
auto = true
sources = ["prisma/schema.prisma"]
outputs = ["node_modules/.prisma/"]
run = "npx prisma generate"

[prepare.frontend-codegen]
sources = ["schema.graphql", "codegen.ts"]
outputs = ["src/generated/"]
run = "npm run codegen"
```

运行 `mise prep` 会检查所有四个提供者并并行运行过期的那些。
