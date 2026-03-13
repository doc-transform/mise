# Monorepo 任务 <Badge type="warning" text="experimental" />

mise 支持使用目标路径语法的 monorepo 风格任务组织。此功能允许你在单个仓库中管理多个项目的任务，每个项目可以有自己的 `mise.toml` 配置，包含可能与调用位置不同的工具、环境变量和任务。

## 概述

当在根 `mise.toml` 中启用 `experimental_monorepo_root` 时，mise 会自动发现子目录中的任务，并以其相对于 monorepo 根目录的路径为前缀。这在整个仓库中创建了统一的任务命名空间。

:::: tip
包含 `mise.toml` 文件的目录称为 **config_root**。在 monorepo 模式下，每个项目可以有自己的 config_root 和独立于 monorepo 根目录的配置。注意如果你在子目录中使用替代路径（如 `./projects/frontend/.mise/config.toml`），config_root 将是 `./projects/frontend` 而不是 `./projects/frontend/.mise`。
::::

### 优势

- **一致的执行**：从 monorepo 中的任何位置运行任务，使用的 mise 配置与从任务所在目录调用时相同
- **清晰的任务命名空间**：任务以其相对于 monorepo 根目录的位置为前缀
- **基于模式的执行**：使用通配符跨多个项目运行任务
- **工具和环境层叠**：子目录任务使用父配置中的工具和环境变量，同时也可以在其 config_root 中定义自己的
- **自动信任传播**：当 monorepo 根目录被信任时，所有后代配置自动被信任

## 配置

### 启用 Monorepo 模式

在根 `mise.toml` 中添加 `experimental_monorepo_root = true`：

```toml
# /myproject/mise.toml
experimental_monorepo_root = true

[tools]
# 这里定义的工具适用于所有子目录
node = "20"
```

:::: warning
此功能需要设置 `MISE_EXPERIMENTAL=1` 环境变量。
::::

### 示例结构

```
myproject/
├── mise.toml (包含 experimental_monorepo_root = true)
├── projects/
│   ├── frontend/
│   │   └── mise.toml (包含任务: build, test)
│   └── backend/
│       └── mise.toml (包含任务: build, test)
```

使用此结构，任务将自动被命名空间化：

- `//projects/frontend:build`
- `//projects/frontend:test`
- `//projects/backend:build`
- `//projects/backend:test`

## 任务路径语法

Monorepo 任务使用带 `//` 和 `:` 前缀的特殊路径语法。你可以直接用 `mise` 或用 `mise run` 运行这些任务。对于非 monorepo 任务，指导原则是避免在脚本中使用直接语法，因为可能与未来的核心 mise 命令冲突。但是，mise 永远不会定义带 `//` 或 `:` 前缀的命令，因此此指导原则不适用于 monorepo 任务。

```bash
# 直接语法（monorepo 任务推荐）
mise //projects/frontend:build

# 也可以用 'run'
mise run //projects/frontend:build

# 通配符需要引号
mise '//projects/frontend:*'
```

### 绝对路径

使用 `//` 前缀指定从 monorepo 根目录的绝对路径：

```bash
# 运行 frontend 项目中的 build 任务
mise //projects/frontend:build

# 运行 backend 项目中的 test 任务
mise //projects/backend:test
```

### 当前 config_root 任务

使用 `:` 前缀运行当前 config_root 中的任务：

```bash
cd projects/frontend
mise :build  # 运行 frontend config_root 中的 build 任务
```

:::: tip 可选的冒号语法
前导 `:` 在从子目录运行任务或定义任务依赖时是可选的。虽然两种语法都有效，但**我们鼓励使用 `:` 前缀以明确** monorepo 任务引用。

**从子目录运行：**

```bash
cd projects/frontend
mise :build      # 推荐：明确的 monorepo 任务引用
mise build       # 也有效（为迁移兼容性）
```

**任务依赖：**

```toml
# projects/frontend/mise.toml
[tasks.lint]
run = "eslint ."

[tasks.build]
depends = [":lint"]  # 推荐：明确且清晰
# 或
depends = ["lint"]   # 也有效（为迁移兼容性）
run = "webpack build"
```

不带 `:` 的裸名语法主要是为了方便从非 monorepo 迁移到 monorepo 配置。迁移时你不需要立即更新所有任务依赖——它们会继续工作。但使用 `:` 前缀可以明确你正在引用当前 config_root 中的任务。
::::

### 通配符模式

mise 支持两种通配符类型用于灵活的任务执行：

#### 路径通配符（`...`）

使用省略号（`...`）匹配任意目录深度：

```bash
# 在所有项目中运行 'test' 任务（任意深度）
mise //...:test

# 在 projects/ 下所有子目录中运行 'build'
mise //projects/...:build

# 中间使用通配符匹配路径
mise //projects/.../api:build  # 匹配 projects/*/api 和 projects/*/*/api
```

:::: info
未来版本可能会添加额外的 glob 模式，因此 `mise //projects/*:build` 和 `mise '//projects/**:build'` 可能会被支持。我们使用 `...` 是因为它与 bazel 和 buck2 的方式一致。
::::

#### 任务名通配符（`*`）

使用星号（`*`）匹配任务名称：

```bash
# 运行 frontend 项目中的所有任务
mise '//projects/frontend:*'

# 运行所有以 'test:' 开头的任务
mise '//projects/frontend:test:*'

# 在所有项目中运行 'lint' 任务
mise //...:lint
```

### 组合通配符

你可以组合两种通配符实现强大的模式：

```bash
# 在所有项目中运行所有任务
mise '//...:*'

# 在所有项目中运行所有测试任务
mise '//...:test*'

# 在所有 frontend 相关项目中运行 build 任务
mise //.../frontend:build
```

## 工具和环境层叠

子目录任务自动使用层级中父配置文件的工具和环境变量。但每个子目录也可以在其 config_root 中定义自己的工具和环境变量。这允许你：

1. 在 monorepo 根目录定义通用工具和环境
2. 在特定子目录中覆盖工具或环境
3. 在子目录中添加额外的工具或环境

### 层叠示例

```toml
# /myproject/mise.toml
experimental_monorepo_root = true

[tools]
node = "20"      # 对所有子目录可用
python = "3.12"  # 对所有子目录可用

[env]
LOG_LEVEL = "info"  # 对所有子目录可用
```

```toml
# /myproject/projects/frontend/mise.toml
[tools]
node = "18"  # 覆盖根目录的 node 20

[env]
LOG_LEVEL = "debug"  # 覆盖根目录的 LOG_LEVEL
PORT = "3000"        # 添加新环境变量

[tasks.build]
run = "npm run build"  # 使用 node 18 和 LOG_LEVEL=debug
```

```toml
# /myproject/projects/backend/mise.toml
# 没有 tools 或 env 部分 - 使用根目录的 node 20、python 3.12 和 LOG_LEVEL=info

[tasks.build]
run = "npm run build"  # 使用根目录的 node 20 和 LOG_LEVEL=info
```

### 层叠规则

1. **基础工具集和环境**：任务从所有全局配置文件（包括层级中的父配置）的工具和环境开始
2. **子目录覆盖**：子目录配置文件中定义的工具和环境合并到顶部，允许覆盖
3. **任务特定的工具和环境**：任务 `tools` 和 `env` 属性中定义的值优先级最高

## Config Roots

你必须使用 `[monorepo]` 部分明确列出你的 config roots：

```toml
# /myproject/mise.toml
experimental_monorepo_root = true

[monorepo]
config_roots = [
    "packages/frontend",
    "packages/backend",
    "services/*",          # 单级 glob 模式
]
```

这告诉 mise 哪些目录包含项目配置。优势：

- **快速发现**：无需文件系统遍历
- **明确控制**：只包含你列出的项目
- **Glob 支持**：使用 `*` 进行单级模式匹配（例如 `services/*` 匹配 `services/api`、`services/worker`）

:::: tip
支持单级 glob（`*`），但不支持递归 glob（`**`）。这确保了可预测的性能同时仍允许灵活的模式。
::::

:::: warning 自动发现已废弃
自动文件系统遍历来发现 monorepo 子目录已废弃。如果你不定义 `[monorepo].config_roots`，mise 仍会遍历文件系统但会发出废弃警告。请迁移到明确的 config roots。
::::

## 列出任务

`mise tasks` 和 `mise tasks --all` 的区别：

- **`mise tasks`**：列出当前 config_root 层级中的任务（当前 config_root 及其父级）
- **`mise tasks --all`**：列出整个 monorepo 中的任务，包括兄弟和后代目录

### 列出示例

给定以下结构：

```
myproject/
├── mise.toml (任务: deploy)
├── projects/
│   ├── frontend/
│   │   └── mise.toml (任务: build, test)
│   └── backend/
│       └── mise.toml (任务: build, serve)
```

在 `projects/frontend/` 中：

```bash
# 列出: //:deploy, //projects/frontend:build, //projects/frontend:test
mise tasks

# 列出: //:deploy, //projects/frontend:build, //projects/frontend:test,
#        //projects/backend:build, //projects/backend:serve
mise tasks --all
```

### 查看特定项目的任务

```bash
# 列出 frontend 项目中的所有任务
mise tasks '//projects/frontend:*'
```

## 最佳实践

### 1. 在根目录定义共享工具和环境

将常用工具和环境放在根 `mise.toml` 中以避免重复：

```toml
# /myproject/mise.toml
experimental_monorepo_root = true

[tools]
node = "20"
python = "3.12"
go = "1.21"

[env]
NODE_ENV = "development"
```

### 2. 仅在必要时覆盖

仅在子目录确实需要不同版本时才覆盖工具：

```toml
# /myproject/legacy-app/mise.toml
[tools]
node = "14"  # 仅为遗留应用覆盖
# python 和 go 来自根目录
```

### 3. 使用描述性任务名称

使用通用名称前缀来实现模式匹配：

```toml
[tasks.test]
run = "npm test"

[tasks."test:unit"]
run = "npm run test:unit"

[tasks."test:e2e"]
run = "npm run test:e2e"
```

然后运行所有测试任务：`mise '//...:test*'`

### 4. 对相关项目分组

将项目组织在子目录中以实现有针对性的执行：

```
myproject/
├── services/
│   ├── api/
│   ├── worker/
│   └── scheduler/
└── apps/
    ├── web/
    └── mobile/
```

然后按组运行任务：

```bash
mise //services/...:build  # 构建所有服务
mise //apps/...:test       # 测试所有应用
```

## 与其他工具的比较

monorepo 生态系统提供了许多优秀的工具，各有不同的优势。以下是 mise Monorepo 任务与它们的对比：

### 简单任务运行器

**Taskfile** 和 **Just** 是出色的单项目任务自动化工具。它们轻量且易于设置，但并非为 monorepo 设计。虽然你可以在仓库中有多个 Taskfile/Justfile，但它们不提供统一的任务发现、跨项目通配符或跨项目的自动工具/环境层叠。

**mise 的优势：** 整个 monorepo 中的自动任务发现，统一命名空间和强大的通配符模式。

### JavaScript 专用工具

**Nx**、**Turborepo** 和 **Lerna** 是专为 JavaScript/TypeScript monorepo 设计的强大工具。

- **Nx** 提供令人难以置信的功能，如依赖图可视化、受影响项目检测、代码生成和计算缓存。它有庞大的插件生态系统，在前端 monorepo 中表现出色。
- **Turborepo** 专注于极速任务缓存和最小配置的并行执行。
- **Lerna** 开创了 JavaScript monorepo 管理，包括包版本控制和发布工作流。

**mise 的优势：** 语言无关的支持。虽然这些工具在 JS/TS 生态系统中表现出色，但 mise 对 Rust、Go、Python、Ruby 或任何语言组合同样适用。你还获得了统一的工具版本管理（不仅仅是任务）和整个技术栈的环境变量。

### 大规模构建系统

**Bazel**（Google）和 **Buck2**（Meta）是为拥有数千名工程师的大型多语言 monorepo 设计的工业级构建系统。

- **Bazel** 提供令人难以置信的功能，如分布式缓存、远程执行和细粒度依赖跟踪的密封构建。
- **Buck2** 是一个现代重写版本，具有清晰的架构和令人印象深刻的性能优化。

两者都非常强大，但带来了显著的复杂性：

- 密封构建需要严格的隔离和完整的依赖控制
- 学习曲线陡峭，需要专门的 DSL（Starlark 等）
- 复杂的配置需要专门的构建工程师
- 远程缓存需要大量基础设施投资
- 对代码结构有更严格的约束

**mise 的优势：** 通过非密封构建实现简洁。mise 不试图在隔离环境中控制你的整个构建环境——而是以灵活、实用的方式管理工具和任务。这种"非密封"的方式意味着你可以使用 mise 而不需要重构整个代码库或学习新语言。你用简单的 TOML 配置获得了强大的 monorepo 任务管理——对大多数团队来说足够强大，而不需要密封构建所需的企业级复杂性。

### 其他值得注意的工具

**Rush**（Microsoft）为 JavaScript monorepo 提供严格的依赖管理和构建编排，注重安全性和规范遵循。

**Moon** 是一个较新的基于 Rust 的构建系统，旨在对开发者友好同时支持多语言。

### mise 的定位

mise 的 Monorepo 任务旨在在简洁与强大之间找到平衡点：

| 特性             | 简单运行器 | JS 专用 | 构建系统 | mise |
| --------------- | --------- | ------- | ------- | ---- |
| 多语言支持       | ✅         | ❌      | ✅      | ✅   |
| 易于学习         | ✅         | ⚠️      | ❌      | ✅   |
| 统一任务发现      | ❌         | ✅      | ✅      | ✅   |
| 通配符模式       | ❌         | ⚠️      | ✅      | ✅   |
| 工具版本管理      | ❌         | ❌      | ⚠️      | ✅   |
| 环境层叠         | ❌         | ⚠️      | ❌      | ✅   |
| 最小设置         | ✅         | ⚠️      | ❌      | ✅   |
| 任务缓存         | ❌         | ✅      | ✅      | ❌   |

**何时选择 mise：**

- ✅ 多语言 monorepo
- ✅ 你想要统一的工具 + 任务管理
- ✅ 你偏好简洁而非最大性能
- ✅ 你已经在使用 mise 进行工具管理

**何时考虑替代方案：**

- 你完全使用 JavaScript/TypeScript → Nx 或 Turborepo 可能提供更多 JS 特定功能
- 你在 Google/Meta 规模有数千名工程师 → Bazel 或 Buck2 提供分布式构建基础设施
- 你需要高级任务缓存 → Nx、Turborepo 或 Bazel 提供复杂的缓存系统

最好的工具是适合你团队需求的工具。mise 的 Monorepo 任务设计用于想要强大 monorepo 管理而无需复杂性开销的团队，特别是在跨多语言工作时。

## 任务模板

对于具有相似任务模式的 monorepo 项目，[任务模板](/tasks/templates)允许你在 monorepo 根目录定义可复用的任务定义：

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
```

项目可以扩展这些模板：

```toml
# packages/api/mise.toml
[tasks.build]
extends = "python:build"

[tasks.test]
extends = "python:test"
run = "pytest --cov"  # 覆盖添加覆盖率
```

参阅[任务模板](/tasks/templates)获取完整文档。

## 相关文档

- [任务模板](/tasks/templates) - 可复用的任务定义
- [任务配置](/tasks/task-configuration) - 所有任务配置选项
- [运行任务](/tasks/running-tasks) - 如何执行任务
- [配置](/configuration) - mise 通用配置
