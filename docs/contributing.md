---
outline: [1, 3]
---

# 贡献指南

提交 PR 之前，除非是很明显的改动，建议先创建一个 [discussion](https://github.com/jdx/mise/discussions) 或在 [Discord](https://discord.gg/UBa7pJUN7Z) 中提及你的计划。PR 经常被拒绝或在提交后需要大幅修改，所以在开始工作前请确保不会白费力气。

## 贡献准则

1. **开始之前**：对于非显而易见的改动，先创建 discussion 或在 Discord 中讨论
2. **充分测试**：确保单元测试和 E2E 测试都通过
3. **遵循规范**：使用现有的代码风格和模式
4. **更新文档**：为新功能添加/更新文档

### Pull Request 工作流

1. **PR 标题**：必须遵循约定式提交格式（自动验证）
   - 对于注册表中的新工具：使用 `registry: add tool-name (backend:full/name)`
2. **自动格式化**：代码会被 autofix.ci 自动格式化
3. **CI 检查**：所有测试必须在 Linux、macOS 和 Windows 上通过
4. **覆盖率**：新代码应保持或提升测试覆盖率
5. **依赖**：新依赖通过 cargo-deny 验证

### 开发技巧

1. **开发时禁用 mise**：如果你在 shell 中使用了 mise，运行测试时请禁用以避免冲突
2. **使用 dev container**：提供了 Docker 环境（目前需要修复）
3. **测试特定功能**：使用 `cargo test test_name` 进行针对性测试
4. **更新快照**：修改测试输出时使用 `mise run snapshots`
5. **速率限制**：设置 `MISE_GITHUB_TOKEN` 以避免开发中的 GitHub API 速率限制

## 打包和自更新说明

当 mise 通过包管理器安装时，应用内自更新会被禁用，用户应通过包管理器更新。打包时应在 `lib/mise-self-update-instructions.toml`（或 `lib/mise/mise-self-update-instructions.toml`）安装一个 TOML 文件，包含平台特定的更新说明。示例内容：

```toml
# Debian/Ubuntu (APT)
message = "To update mise from the APT repository, run:\n\n  sudo apt update && sudo apt install --only-upgrade mise\n"
```

```toml
# Fedora/CentOS Stream (DNF)
message = "To update mise from COPR, run:\n\n  sudo dnf upgrade mise\n"
```

## 测试

mise 拥有全面的测试套件，包含多种类型的测试以确保跨平台和不同场景下的可靠性和功能性。

### 单元测试

单元测试是快速、针对单个组件和函数的测试：

```bash
# 运行所有单元测试
cargo test --all-features

# 运行特定单元测试
cargo test <test_name>
```

**单元测试结构：**

- 位于 `src/` 目录中，与源代码放在一起
- 使用 Rust 内置测试框架
- 测试单个函数和模块
- 执行速度快（用于开发时的快速反馈）

### E2E 测试

端到端测试在真实场景中验证 mise 的完整功能：

```bash
# 运行所有 E2E 测试
mise run test:e2e

# 运行特定 E2E 测试
./e2e/run_test test_name

# 运行匹配模式的 E2E 测试
./e2e/run_test task  # 运行匹配 *task* 的测试

# 运行所有测试（包括慢速测试）
TEST_ALL=1 mise run test:e2e
```

**E2E 测试结构：**

- 位于 `e2e/` 目录
- 按功能组织：
  - `e2e/cli/` - 命令行接口测试
  - `e2e/core/` - 核心功能测试
  - `e2e/env/` - 环境变量测试
  - `e2e/tasks/` - 任务运行器测试
  - `e2e/config/` - 配置测试
  - `e2e/tools/` - 工具管理测试
  - `e2e/shell/` - Shell 集成测试
  - `e2e/backend/` - 工具源测试
  - `e2e/plugins/` - 插件测试

**E2E 测试分类：**

- **快速测试**（`test_*`）：在正常测试套件中运行
- **慢速测试**（`test_*_slow`）：仅在 `TEST_ALL=1` 时运行
- **隔离环境**：每个测试在干净的隔离环境中运行

### 覆盖率测试

覆盖率测试衡量代码库有多少被测试覆盖：

```bash
# 运行覆盖率测试
mise run test:coverage

# 覆盖率测试在 CI 中并行分批运行
TEST_TRANCHE=0 TEST_TRANCHE_COUNT=8 mise run test:coverage
```

### Windows E2E 测试

Windows 有自己的用 PowerShell 编写的测试套件：

```powershell
# 运行所有 Windows E2E 测试
pwsh e2e-win\run.ps1

# 运行特定 Windows 测试
pwsh e2e-win\run.ps1 task  # 运行匹配 *task* 的测试
```

### 插件测试

测试不同工具源的插件功能：

```bash
# 测试特定插件
mise test-tool ripgrep

# 测试注册表中的所有插件
mise test-tool --all

# 测试配置文件中的所有插件
mise test-tool --all-config

# 并行测试
mise test-tool --all --jobs 4
```

### 测试环境配置

测试在隔离环境中运行以避免冲突：

```bash
# 开发测试时禁用 mise
export MISE_DISABLE_TOOLS=1

# 在特定环境中运行测试
MISE_TRUSTED_CONFIG_PATHS=$PWD cargo test
```

### 测试断言

E2E 测试使用自定义断言框架（`e2e/assert.sh`）：

```bash
# 基本断言
assert "command" "expected_output"
assert_contains "command" "substring"
assert_fail "command" "expected_error"

# JSON 断言
assert_json "command" '{"key": "value"}'
assert_json_partial_array "command" "fields" '[{...}]'

# 文件/目录断言
assert_directory_exists "/path/to/dir"
assert_directory_not_exists "/path/to/dir"
assert_empty "command"
```

### 运行特定测试类别

```bash
# 运行所有测试（单元 + e2e）
mise run test

# 仅运行单元测试
mise run test:unit

# 仅运行 e2e 测试
mise run test:e2e

# 随机顺序运行测试（检测顺序依赖）
mise run test:shuffle

# 运行 nightly 测试（使用最新 Rust）
rustup default nightly && mise run test
```

### 运行单个测试

#### 运行单个单元测试

```bash
# 按名称运行特定单元测试
cargo test test_name

# 运行匹配模式的测试
cargo test pattern

# 运行特定模块中的测试
cargo test module_name

# 运行单个测试并输出
cargo test test_name -- --nocapture
```

#### 运行单个 E2E 测试

```bash
# 按名称运行特定 E2E 测试
./e2e/run_test test_name

# 运行匹配模式的 E2E 测试
mise run test:e2e pattern

# 示例：
./e2e/run_test test_use                    # 运行特定测试
./e2e/run_test test_config_set            # 运行配置相关测试
mise run test:e2e task                     # 运行所有匹配 "task" 的测试
```

#### 测试单个插件

```bash
# 测试特定插件
mise test-tool ripgrep

# 带详细输出测试插件
mise test-tool ripgrep --raw

# 测试多个插件
mise test-tool ripgrep jq terraform
```

### 性能测试

```bash
# 运行性能基准测试
mise run test:perf

# 构建性能测试工作区
mise run test:build-perf-workspace
```

### 快照测试

用于测试输出的一致性：

```bash
# 输出变更时更新测试快照
mise run snapshots

# 使用 cargo-insta 进行快照测试
cargo insta test --accept --unreferenced delete
```

## 开发环境配置

### 前置要求

- [Rust](https://www.rust-lang.org/)（最新稳定版，我们不用 mise 来管理 rust）
- mise

### 开始

```bash
# 克隆仓库
git clone https://github.com/jdx/mise.git
cd mise

# 安装依赖
mise install

# 构建项目
mise run build
```

### 开发用 Shim

创建一个开发用 shim 以便在开发时轻松运行 mise：

```bash
# 创建 ~/.local/bin/@mise
#!/bin/sh
exec cargo run -q --all-features --manifest-path ~/src/mise/Cargo.toml -- "$@"
```

然后使用 `@mise` 运行开发版本：

```bash
@mise --help
eval "$(@mise activate zsh)"
```

## 项目结构

```text
mise/
├── src/           # 主 Rust 源代码
├── e2e/           # 端到端测试
├── docs/          # 文档
├── tasks.toml     # 开发任务
├── mise.toml      # 项目配置
├── Cargo.toml     # Rust 项目配置
└── xtasks/        # 额外构建脚本
```

## 可用的开发任务

使用 `mise tasks` 查看所有可用的开发任务：

### 常用任务

- `mise run build` - 构建项目
- `mise run test` - 运行所有测试（单元 + E2E）
- `mise run test:unit` - 仅运行单元测试
- `mise run test:e2e` - 仅运行 E2E 测试
- `mise run lint` - 运行代码检查
- `mise run lint:fix` - 运行代码检查并修复
- `mise run format` - 格式化代码
- `mise run clean` - 清理构建产物
- `mise run snapshots` - 更新测试快照
- `mise run render` - 生成文档和补全

### 文档任务

- `mise run docs` - 启动文档开发服务器
- `mise run docs:build` - 构建文档
- `mise run render:help` - 生成帮助文档
- `mise run render:completions` - 生成 shell 补全

### 发布任务

- `mise run release` - 创建发布
- `mise run ci` - 运行 CI 任务（格式化、构建、测试）

## 环境配置

应该不需要什么特殊配置，但 `mise run build` 是一个很好的完整性检查命令，可以确认一切正常。

## Dev Container

::: danger
Docker 环境已经无法正常工作了，由于我自己不使用，所以还没有修复。目前你需要在 Docker 之外运行，或者你可以尝试修复 Docker 配置。
:::

有一个 Docker 环境可以让 mise 的开发更容易。它对运行 E2E 测试特别有帮助。以下是一些使用示例：

```sh
mise run docker:cargo build
mise run docker:cargo test
mise run docker:mise --help # 在 dev container 中运行 `mise --help`
# 在 Docker 容器中运行 e2e 测试
mise run docker:mise run test:e2e
# `mise run docker:mise run test:e2e` 的简写
mise run docker:e2e
```

## Pre-commit 钩子与代码质量

mise 使用 [hk](https://hk.jdx.dev) 作为 git 钩子管理器，用于代码检查和质量控制。hk 是 lefthook 的现代替代品，由 mise 的同一作者编写。

### hk 配置

项目使用 `hk.pkl`（用 Pkl 配置语言编写）来定义代码检查规则：

```bash
# 运行所有检查
hk check --all

# 运行检查并修复
hk fix --all

# 运行特定检查
hk check --step shellcheck
```

### hk 中可用的检查器

- **prettier**：多语言代码格式化
- **clippy**：Rust 代码检查，使用 `cargo clippy`
- **shellcheck**：Shell 脚本检查
- **shfmt**：Shell 脚本格式化
- **pkl**：Pkl 配置文件验证

### 在开发中使用 hk

```bash
# 运行检查（用于 CI 和 pre-commit）
mise run lint  # 实际运行 hk check --all

# 运行检查并修复
hk fix --all

# 检查特定文件类型
hk check --step prettier
hk check --step shellcheck
```

### Pre-commit 任务配置

mise 定义了一个运行主要检查的 `pre-commit` 任务：

```toml
[pre-commit]
env = { PRE_COMMIT = 1 }
run = ["mise run lint"]
```

此任务：

1. 设置 `PRE_COMMIT=1` 环境变量
2. 运行 `mise run lint`，它会执行 `hk check --all`

### 设置 Pre-commit 钩子

```bash
# 设置 git 钩子运行 mise 的 pre-commit 任务
mise generate git-pre-commit --write --task=pre-commit
```

### 手动运行 Pre-commit 检查

```bash
# 运行所有 pre-commit 检查
mise run pre-commit

# 运行特定检查
mise run lint

# 运行检查并修复
hk fix --all

# 检查特定文件
hk check --files="src/**/*.rs"
```

## 运行 CLI

即使使用 devcontainer，创建一个 shim 以方便启动 mise 也是好主意。我在 `~/.local/bin/@mise` 中使用以下 shim：

```sh
#!/bin/sh
exec cargo run -q --all-features --manifest-path ~/src/mise/Cargo.toml -- "$@"
```

::: info
不要忘记将 manifest 路径改为你自己的正确路径。
:::

然后如果它在 PATH 中，只需使用 `@mise` 即可通过即时编译运行 mise。

```sh
@mise --help
@mise run docker:e2e
eval "$(@mise activate zsh)"
@mise activate fish | source
```

## 发布

运行 `mise run release -x [minor|patch]`。（如果是当月第一次发布则用 minor）

## 代码检查

- 检查代码库：`mise run lint`
- 检查并修复代码库：`mise run lint:fix`

## 生成 readme 和 shell 补全文件

```sh
mise run render
```

## 依赖管理

mise 使用多个工具来验证依赖和代码质量：

- **cargo-deny**：验证许可证、安全公告和重复依赖
- **cargo-msrv**：验证最低支持的 Rust 版本兼容性
- **cargo-machete**：检测 Cargo.toml 中未使用的依赖

这些检查在 CI 中自动运行，也可以在本地运行：

```bash
# 运行检查（工具通过 mise.toml 自动可用）
cargo deny check
cargo msrv verify
cargo machete --with-metadata
```

## 约定式提交

mise 使用[约定式提交](https://www.conventionalcommits.org/)来保持提交消息的一致性和自动化变更日志生成。所有提交应遵循以下格式：

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

- **feat**：新功能（🚀 Features）
- **fix**：Bug 修复（🐛 Bug Fixes）
- **refactor**：代码重构（🚜 Refactor）
- **docs**：文档变更（📚 Documentation）
- **style**：代码风格变更（🎨 Styling）
- **perf**：性能优化（⚡ Performance）
- **test**：测试变更（🧪 Testing）
- **chore**：维护任务、依赖更新
- **revert**：回退之前的变更（◀️ Revert）

### 示例

```bash
feat(cli): add new command for listing plugins
fix(parser): handle edge case in version parsing
refactor(config): simplify configuration loading logic
docs(readme): update installation instructions
test(e2e): add tests for new plugin functionality
chore(deps): update dependencies to latest versions
```

### 作用域

mise 中常用的作用域：

- `cli` - 命令行接口变更
- `config` - 配置系统变更
- `parser` - 解析逻辑变更
- `deps` - 依赖更新
- `security` - 安全相关变更

### 破坏性变更

#### 破坏性变更政策

破坏性变更在 mise 中很少被接受，只有在没有更好替代方案的特殊情况下才会进行。当需要破坏性变更时，流程包括：

1. **CLI 警告**：用户会在 CLI 中收到弃用警告
2. **迁移期**：提供数月的迁移时间
3. **文档**：提供清晰的迁移指南
4. **社区通知**：在 Discord 和 GitHub discussions 中公告

对于破坏性变更，在类型后加 `!` 或在 footer 中包含 `BREAKING CHANGE:`：

```bash
feat(api)!: remove deprecated configuration options
# 或
feat(api): remove deprecated configuration options

BREAKING CHANGE: The old configuration format is no longer supported
```

## CI/CD 与 Pull Request 自动化

mise 使用多个自动化工作流来维护代码质量和简化开发流程：

### 自动代码格式化

- **autofix.ci**：自动格式化代码并修复 PR 中的 lint 问题
- 自动运行 `mise run render` 和 `mise run lint-fix`
- 将修复直接提交到 PR 分支

### PR 标题验证

- **semantic-pr-lint**：验证 PR 标题遵循约定式提交格式
- PR 标题必须匹配：`<type>[optional scope]: <description>`
- 示例：`feat(cli): add new command for listing plugins`

### 持续集成

- **跨平台测试**：Ubuntu、macOS 和 Windows
- **单元测试**：快速的组件级测试
- **E2E 测试**：完整的集成测试，分多批运行
- **依赖验证**：`cargo deny`、`cargo msrv`、`cargo machete`

### 发布自动化

- **release-plz**：基于约定式提交的自动化发布管理
- 自动创建发布 PR 并发布
- 通过定时工作流每天运行
- 处理版本号递增和变更日志生成

## 添加新设置

要添加新设置，将其添加到项目根目录的 [`settings.toml`](https://github.com/jdx/mise/blob/main/settings.toml) 中，然后运行 `mise run render` 更新代码库。

## 添加工具

向 mise 添加工具需要在 [registry/](https://github.com/jdx/mise/blob/main/registry/) 文件中添加条目。这使得用户可以使用短名称如 `mise use ripgrep` 而不需要完整的工具源规范。

### 快速开始

1. **选择合适的工具源**：

   - **[aqua](dev-tools/backends/aqua.md)** - 适合 GitHub releases，带安全特性
   - **[github](dev-tools/backends/github.md)** - 简单的 GitHub releases，遵循标准约定
   - **语言包管理器** - `npm`、`pipx`、`cargo`、`gem` 等，适合各语言生态特定工具
   - **[核心工具](core-tools.md)** - 主要语言的内置支持（非用户贡献）

2. **添加到 registry/**：

   ```toml
   [tools.your-tool]
   description = "Brief description of the tool"
   backends = ["aqua:owner/repo", "github:owner/repo"]
   test = ["your-tool --version", "{{version}}"]
   ```

3. **测试工具**是否正常工作：`mise test-tool your-tool`

### 准则和要求

添加新工具时，以下要求适用（由 [GitHub Actions 工作流](https://github.com/jdx/mise/blob/main/.github/workflows/registry_comment.yml)自动执行）：

- **不接受新的 asdf 插件** - 请使用 aqua/github
- **需要在 `registry/` 中包含测试** - 必须包含 `test` 字段以验证安装
- **工具可能因不够知名而被拒绝** - 工具应该有一定的流行度且维护良好。这方面没有具体标准，会考虑很多因素。@jdx 不会解释为什么某个工具没有被接受

### 注册表格式

`registry/` 文件使用以下格式：

```toml
# 工具名称 "your-tool"（作为 `mise use` 的短名称）
[tools.your-tool]
description = "Tool description"
backends = [
    "aqua:owner/repo",           # 优先工具源
    "github:owner/repo",         # 备选工具源
    "npm:package-name"           # 支持多个工具源
]
test = [
    "your-tool --version",       # 要运行的命令
    "{{version}}"                # 预期输出模式
]
aliases = ["alt-name"] # 可选的替代名称
os = ["linux", "macos"] # 可选的操作系统限制
```

### 工具源优先级

按优先级顺序列出工具源。用户会获得第一个可用的工具源，但可以通过显式语法如 `mise use aqua:owner/repo` 来覆盖。

### 工具测试

所有工具必须包含测试以验证安装正确：

```toml
test = [
    "command-to-run",
    "expected-output-pattern"
]
```

测试命令应该可靠，输出模式应使用 `{{version}}` 来匹配任何版本号。

### 注册表示例

近期添加的工具：

- **DuckDB**：简单的 github 工具源（[#4248](https://github.com/jdx/mise/pull/4248)）

  ```toml
  [tools.duckdb]
  backends = ["github:duckdb/duckdb"]
  test = ["duckdb --version", "{{version}}"]
  ```

- **Biome**：多个工具源（[#4283](https://github.com/jdx/mise/pull/4283)）

  ```toml
  [tools.biome]
  backends = ["aqua:biomejs/biome", "github:biomejs/biome"]
  test = ["biome --version", "Version: {{version}}"]
  ```

## 添加工具源

:::warning 工具源 vs 工具的区别
**大多数贡献者想要添加的是工具，而不是工具源。** 在阅读本节之前，请确认你确实需要新的工具源。工具是具体的软件包（如 `node` 或 `ripgrep`），而工具源是安装机制（如 `aqua` 或 `github`）。如果你想向 mise 添加具体工具，请参见[添加工具](#adding-tools)。
:::

:::warning 核心工具源接受政策
**新的工具源不太可能被接受到 mise 核心中。** 它们需要大量维护，因此通常最好使用[工具源插件系统](backend-plugin-development.md)来添加，无需修改核心代码。只有在某个主要包管理器或工具能极大增强 mise 能力的情况下，新工具源才会被接受。

如果你需要自定义工具源：

1. **先与 jdx 讨论**，在 [Discord](https://discord.gg/UBa7pJUN7Z) 中或创建 [discussion](https://github.com/jdx/mise/discussions)
2. **考虑现有工具源**（github、aqua、npm、pipx 等）是否能满足你的需求
3. **创建插件** - 使用[插件系统](tool-plugin-development.md)为私有/自定义工具创建插件，无需修改核心代码。使用 [mise-tool-plugin-template](https://github.com/jdx/mise-tool-plugin-template) 快速上手

大多数工具安装需求可以通过现有工具源满足，特别是用于 GitHub releases 的 [github](dev-tools/backends/github.md) 和用于全面包管理的 [aqua](dev-tools/backends/aqua.md)。
:::

工具源是 mise 对不同工具安装方式的抽象。每个工具源实现 `Backend` trait 以在不同安装系统间提供一致的功能。

### 工具源类型

- **核心工具源**（`src/backend/core/`）- 内置语言运行时，如 Node.js、Python、Ruby
- **包管理器工具源**（`src/backend/`）- npm、pipx、cargo、gem、go modules
- **通用安装器**（`src/backend/`）- github、aqua，用于 GitHub releases 和包管理
- **插件工具源**（`src/backend/`）- 插件可以提供自定义工具源或单个工具

### 实现步骤

1. **在 `src/backend/` 中创建工具源模块**（如 `my_backend.rs`）

2. **实现 Backend trait**：

   ```rust
   use crate::backend::{Backend, BackendType};
   use crate::install_context::InstallContext;

   #[derive(Debug)]
   pub struct MyBackend {
       // 工具源特定字段
   }

   impl Backend for MyBackend {
       fn get_type(&self) -> BackendType { BackendType::MyBackend }

       async fn list_remote_versions(&self) -> Result<Vec<String>> {
           // 列出可用版本的实现
       }

       async fn install_version(&self, ctx: &InstallContext,
                                 tv: &ToolVersion) -> Result<()> {
           // 安装特定版本的实现
       }

       async fn uninstall_version(&self, tv: &ToolVersion) -> Result<()> {
           // 卸载版本的实现
       }

       // ... 其他必需方法
   }
   ```

3. **在 `src/backend/mod.rs` 中注册工具源**：

   - 添加你的工具源到 imports
   - 添加到工具源注册/工厂函数
   - 添加 `BackendType` 枚举变体

4. **如需添加 CLI 参数解析**，在 `src/cli/args/backend_arg.rs` 中处理

5. **更新注册表**（`registry/`），如果需要作为简写名称使用

### 测试要求

- **集成测试**在 `e2e/backend/test_my_backend` 中
- **测试工具的安装和使用**
- **Windows 测试**（如果工具源支持 Windows）

### 文档

- **更新工具源文档**在 `docs/dev-tools/backends/` 中
- **添加使用示例**展示如何用你的工具源安装工具
- **更新注册表文档**（如果添加了新的简写工具）

### 实现参考

可以参考现有工具源的模式：

- `src/backend/github.rs` - 简单的 GitHub release 安装器
- `src/backend/npm.rs` - 包管理器集成
- `src/backend/core/node.rs` - 完整的语言运行时实现

有关详细的架构信息，请参见[工具源架构](dev-tools/backend_architecture.md)。

## 测试打包

只有在实际修改打包配置时才需要进行。

### Ubuntu (apt)

以下为 arm64，你可以改为 amd64。

```sh
docker run -ti --rm ubuntu
apt update -y
apt install -y curl
install -dm 755 /etc/apt/keyrings
curl -fSso /etc/apt/keyrings/mise-archive-keyring.pub https://mise.jdx.dev/gpg-key.pub
echo "deb [signed-by=/etc/apt/keyrings/mise-archive-keyring.pub arch=arm64] \
https://mise.jdx.dev/deb stable main" >/etc/apt/sources.list.d/mise.list
apt update -y
apt install -y mise
mise -V
```

### Fedora (dnf)

```sh
docker run -ti --rm fedora
dnf copr enable -y jdxcode/mise && dnf install -y mise && mise -v
```

### RHEL (dnf)

```sh
docker run -ti --rm registry.access.redhat.com/ubi9/ubi:latest
dnf copr enable -y jdxcode/mise && dnf install -y mise && mise -v
```
