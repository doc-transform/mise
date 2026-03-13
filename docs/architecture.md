---
outline: [1, 3]
---

# mise 架构

本文档全面介绍了 mise 的架构，主要面向贡献者和希望了解 mise 内部工作原理的人员。

有关实际开发指导，请参见[贡献指南](contributing.md)。

## 系统概述

mise 是一个基于 Rust 的工具，采用模块化架构，围绕三个核心概念：

1. **工具版本管理** - 安装和管理不同版本的[开发工具](dev-tools/)
2. **环境管理** - 配置[环境变量](environments/)和项目上下文
3. **任务运行** - 执行带有依赖管理的[项目任务](tasks/)

这三大支柱协同工作，提供统一的开发环境管理体验。

## 核心架构组件

### 命令层（[`src/cli/`](https://github.com/jdx/mise/tree/main/src/cli/)）

CLI 层提供用户界面并委托给核心功能：

- **模块化命令**：每个命令是独立模块（[`install.rs`](https://github.com/jdx/mise/blob/main/src/cli/install.rs)、[`use.rs`](https://github.com/jdx/mise/blob/main/src/cli/use.rs)、[`run.rs`](https://github.com/jdx/mise/blob/main/src/cli/run.rs) 等）
- **参数解析**：利用 [`clap`](https://clap.rs) 进行健壮的 CLI 解析和验证
- **异步命令执行**：所有命令支持并发操作
- **统一错误处理**：所有命令的错误报告一致

**关键命令架构：**

- [`install`](cli/install.md) - 工具安装协调
- [`use`](cli/use.md) - 工具激活和配置管理
- [`run`](cli/run.md) - 带依赖解析的任务执行
- [`env`](cli/env.md) - 环境变量管理
- [`shell`](cli/shell.md) - Shell 集成和激活

### 工具源系统（[`src/backend/`](https://github.com/jdx/mise/tree/main/src/backend/)）

工具源系统是 mise 工具管理的核心抽象，采用基于 trait 的架构：

```rust
pub trait Backend: Debug + Send + Sync {
    async fn list_remote_versions(&self, config: &Arc<Config>) -> Result<Vec<String>>;
    async fn install_version(&self, ctx: &InstallContext, tv: ToolVersion) -> Result<ToolVersion>;
    async fn uninstall_version(&self, tv: &ToolVersion) -> Result<()>;
    // ... 其他生命周期管理方法
}
```

**工具源分类：**

- **核心工具源**：原生 Rust 实现，性能最优
- **语言包管理器**：npm、pipx、cargo、gem、go modules
- **通用安装器**：github（GitHub releases）、aqua（全面包管理）
- **插件系统**：[工具源插件](backend-plugin-development.md)（增强方法）、[工具插件](tool-plugin-development.md)（基于钩子）、[asdf 插件](asdf-legacy-plugins.md)（旧版）

有关实现新工具源的指导，请参见[贡献指南](contributing.md#adding-backends)。有关工具源系统详细设计，请参见[工具源架构](dev-tools/backend_architecture.md)。

### 配置系统（[`src/config/`](https://github.com/jdx/mise/tree/main/src/config/)）

分层配置系统，合并来自多个配置文件的设置：

**配置 Trait 架构：**

```rust
pub trait ConfigFile: Debug + Send + Sync {
    fn get_path(&self) -> &Path;
    fn to_tool_request_set(&self) -> Result<ToolRequestSet>;
    fn env_entries(&self) -> Result<Vec<EnvDirective>>;
    fn tasks(&self) -> Vec<&Task>;
    // ... 其他配置方法
}
```

**具体实现：**

- `MiseToml` - 主要配置格式，支持完整功能
- `ToolVersions` - asdf 兼容层
- `IdiomaticVersion` - 语言特定的版本文件（`.node-version` 等）

**配置层级：** 请参见[配置文档](configuration.md)了解完整的层级和优先级规则。

### 工具集管理（[`src/toolset/`](https://github.com/jdx/mise/tree/main/src/toolset/)）

协调工具解析、安装和环境配置：

**核心组件：**

- `Toolset` - 特定上下文中已解析工具的不可变集合
- `ToolVersion` - 表示具体的已解析工具版本（如 `node@latest` 变为 `node@18.17.0`）
- `ToolRequest` - 用户的工具规范（如 `node@18`、`python@latest`）
- `ToolsetBuilder` - 从配置中构建工具集，带依赖解析

**工具解析流程：**

1. **配置解析**：从配置文件中提取工具需求
2. **版本解析**：将版本规范（`latest`、`prefix:1.2`、`sub-1:latest` 等）解析为具体版本
3. **工具源选择**：为每个工具选择适当的工具源
4. **依赖分析**：解析工具依赖（如 npm 需要 Node.js）
5. **安装协调**：按依赖顺序安装缺失的工具
6. **环境配置**：设置 PATH 和环境变量

### 任务系统（[`src/task/`](https://github.com/jdx/mise/tree/main/src/task/)）

精密的任务执行系统，带依赖图管理：

**架构组件：**

- `Task` - 任务定义，包含元数据、依赖和执行配置
- `Deps` - 使用 `petgraph` 进行 DAG 操作的依赖图管理器
- `TaskFileProvider` - 从文件和配置中发现任务
- 可配置并发度的并行执行引擎

**任务发现：**

1. 来自配置目录的[文件任务](tasks/file-tasks.md)
2. 配置文件中的 [TOML 任务](tasks/toml-tasks.md)
3. 从父目录继承的任务

**依赖解析：**

- 使用有向无环图（DAG）进行依赖建模
- 支持多种依赖类型：`depends`、`depends_post`、`wait_for`
- 在依赖约束内并行执行
- 循环依赖检测和预防

请参见[任务文档](tasks/)了解完整的使用详情和配置选项，以及[任务架构](tasks/architecture.md)了解详细系统设计。

### 插件系统（[`src/plugins/`](https://github.com/jdx/mise/tree/main/src/plugins/)）

支持多种插件架构的可扩展性层：

**插件 Trait：**

```rust
pub trait Plugin: Debug + Send {
    fn name(&self) -> &str;
    fn path(&self) -> PathBuf;
    async fn install(&self, config: &Arc<Config>, pr: &dyn SingleReport) -> Result<()>;
    async fn update(&self, pr: &dyn SingleReport, gitref: Option<String>) -> Result<()>;
    // ... 生命周期管理方法
}
```

**插件类型：**

- **工具源插件**：增强型插件，提供管理多个工具的工具源方法
- **工具插件**：基于钩子的插件，使用传统 vfox 格式
- **asdf 插件**：旧版插件，兼容 asdf 插件生态（仅限 Linux/macOS）

完整的插件文档请参见[插件指南](plugins.md)。

### Shell 集成（[`src/shell/`](https://github.com/jdx/mise/tree/main/src/shell/)）

Shell 特定的代码生成，将 `mise env` 等命令进行抽象，并将所有 shell 差异集中在一个地方：

**Shell Trait：**

```rust
pub trait Shell: Display {
    fn activate(&self, opts: ActivateOptions) -> String;
    fn set_env(&self, k: &str, v: &str) -> String;
    fn unset_env(&self, k: &str) -> String;
    // ... shell 特定方法
}
```

**支持的 Shell：** 请参见 [`mise activate`](cli/activate.md) 文档了解完整列表
**Shell 抽象：** 环境变量设置、PATH 修改、命令执行

### 环境管理（[`src/env*.rs`](https://github.com/jdx/mise/tree/main/src/)）

环境变量的辅助功能：

- `EnvDiff` - 跟踪和应用环境变更
- `EnvDirective` - 基于配置的环境变量管理
- `PathEnv` - 带优先级规则的智能 PATH 操作
- 带配置分层的上下文感知解析

有关环境配置，请参见[环境文档](environments/)。

### 缓存系统（[`src/cache.rs`](https://github.com/jdx/mise/blob/main/src/cache.rs)）

基于文件的通用缓存，使用 msgpack 序列化和 zstd 压缩：

- `CacheManager<T>` - 带 TTL 支持的通用缓存
- 数据使用 msgpack 序列化并用 zstd 压缩以高效存储
- 基于文件时间戳的自动缓存失效
- 按工具源隔离缓存以保证数据完整性

## 测试架构

mise 采用多层测试策略，结合不同的测试方法，在复杂的功能集上进行全面验证。

**测试策略概述：**

1. **单元测试** - 嵌入在源文件中的 Rust `#[test]` 函数
2. **端到端（E2E）测试** - 基于 Bash 的集成测试，带完整的环境隔离
3. **快照测试** - 使用 `insta` crate 进行复杂输出验证

::: tip 测试理念
**mise 中的大多数测试是端到端测试，这通常也是新功能的首选方法**。E2E 测试提供了对真实使用场景的全面验证，能捕获单元测试可能遗漏的集成问题。然而，**E2E 测试在本地运行可能比较困难**，因为有环境依赖和配置复杂度。对于开发和 CI 目的，在 GitHub Actions 上运行测试通常更容易，因为那里的环境一致且配置正确。

请参见[贡献指南](contributing.md#testing)了解详细的测试配置和指南。
:::

### 单元测试（[`src/` 模块](https://github.com/jdx/mise/tree/main/src/)）

**结构和特征：**

- **位置**：嵌入在源文件中，使用 `mod tests` 块
- **测试运行器**：标准 Rust `cargo test`
- **依赖**：`pretty_assertions`、`insta`、`test-log`、`ctor`
- **覆盖率**：约 50 多个测试模块覆盖所有主要功能

```rust
mod tests {
    use insta::assert_snapshot;
    use pretty_assertions::assert_eq;
    use crate::config::Config;
    use super::*;

    #[tokio::test]
    async fn test_hash_to_str() {
        let _config = Config::get().await.unwrap();
        assert_eq!(hash_to_str(&"foo"), "e1b19adfb2e348a2");
    }
}
```

**测试环境配置：**

- **全局配置**：使用 [`src/test.rs`](https://github.com/jdx/mise/blob/main/src/test.rs) 中的 `ctor::ctor` 进行测试环境初始化
- **隔离环境**：每个测试获得干净的环境，包含自定义的 `HOME`、缓存和配置目录
- **异步支持**：广泛使用 `#[tokio::test]` 进行异步测试

### 端到端测试（[`e2e/`](https://github.com/jdx/mise/tree/main/e2e/)）

**架构：**

```
e2e/
├── run_test          # 单个测试执行器，带环境隔离
├── run_all_tests     # 测试编排器，支持并行执行
├── assert.sh         # 丰富的断言库
├── cli/              # CLI 命令测试
│   ├── test_use      # 测试工具激活和配置
│   ├── test_install  # 测试工具安装
│   ├── test_upgrade  # 测试工具升级
│   ├── test_uninstall # 测试工具卸载
│   └── test_version  # 测试版本命令
├── backend/          # 工具源特定测试
│   ├── test_aqua     # 测试 aqua 包管理器
│   ├── test_asdf     # 测试 asdf 插件兼容性
│   └── test_npm      # 测试 npm 工具源
├── tasks/            # 任务系统测试
│   ├── test_task_deps # 测试任务依赖
│   ├── test_task_run_depends # 测试任务执行顺序
│   ├── test_task_ls  # 测试任务列出
│   └── test_task_info # 测试任务元数据
├── config/           # 配置测试
│   ├── test_config_ls # 测试配置列出
│   └── test_config_set # 测试配置更新
└── [other domains]/  # 其他测试类别
```

**环境隔离系统：**

每个测试在完全隔离的临时目录中运行：

```bash
setup_isolated_env() {
  TEST_ISOLATED_DIR="$(mktemp --tmpdir --directory "$(basename "$TEST").XXXXXX")"
  TEST_HOME="$TEST_ISOLATED_DIR/home"
  MISE_DATA_DIR="$TEST_HOME/.local/share/mise"
  MISE_CACHE_DIR="$TEST_HOME/.cache/mise"
  # ... 完整的环境隔离
}
```

**丰富的断言框架：**

[`assert.sh`](https://github.com/jdx/mise/blob/main/e2e/assert.sh) 提供了丰富的测试工具：

```bash
# 基本断言
assert "command" "expected_output"
assert_contains "command" "substring"
assert_fail "command" "error_message"

# JSON 测试
assert_json "command" '{"key": "value"}'
assert_json_partial_object "command" "field1,field2" '{"field1": "value1"}'

# 文件系统断言
assert_directory_exists "path"
assert_directory_empty "path"
```

**测试类别：**

- **CLI 测试**：验证所有命令行接口和参数解析
- **工具源测试**：测试工具安装、版本解析和工具源集成
- **任务测试**：验证任务执行、依赖解析和并行执行
- **配置测试**：测试配置解析、层级和环境变量处理

### Windows 测试

**Windows 特定测试（[`e2e-win/`](https://github.com/jdx/mise/tree/main/e2e-win/)）：**

- **语言**：PowerShell 脚本（`.ps1`）
- **重点**：Windows 特定功能和跨平台兼容性
- **覆盖**：核心工具如 Go、Java、Node.js、Python、Rust

```powershell
Describe "go" {
    It "installs go" {
        mise install go@latest
        go version | Should -Match "go version"
    }
}
```

### 快照测试（[`src/snapshots/`](https://github.com/jdx/mise/tree/main/src/snapshots/)）

**实现：**

- **Crate**：使用 `insta` 进行快照测试，包含 11 个快照文件
- **格式**：将预期输出存储为 `.snap` 文件
- **覆盖**：复杂输出如目录列表、配置解析、环境差异

```rust
#[tokio::test]
async fn test_parse() {
    let diff = DirenvDiff::parse(input).unwrap();
    assert_snapshot!(diff);  // 创建/验证快照
}
```

### 测试基础设施特性

**性能和工具测试（[`xtasks/test/`](https://github.com/jdx/mise/tree/main/xtasks/test/)）：**

- **性能测试**：`perf` 脚本用于基准测试
- **覆盖率测试**：`coverage` 脚本用于测试覆盖率分析
- **E2E 运行器**：`e2e` 脚本，带过滤功能

**测试数据管理（[`test/`](https://github.com/jdx/mise/tree/main/test/)）：**

```
test/
├── config/           # 测试特定配置
├── cwd/              # 测试工作目录
├── data/             # 测试插件和模拟数据
├── fixtures/         # 示例配置文件
├── plugins/          # 测试插件定义
└── state/            # 测试状态目录
```

**测试执行模式：**

- **快速测试**：常规测试，在 CI 中运行
- **慢速测试**：以 `_slow` 后缀标记，除非 `TEST_ALL=1` 否则跳过
- **分批支持**：测试可以使用 `TEST_TRANCHE_COUNT` 在并行运行器间分批

**开发者体验特性：**

- **环境安全**：完全隔离防止测试影响用户实际的 mise 安装
- **并行执行**：E2E 测试支持带适当隔离的并行执行
- **丰富报告**：详细的测试计时，失败时保留环境以便调试
- **跨平台验证**：在多个操作系统上自动测试

**运行测试：**

```bash
# 运行所有单元测试
cargo test

# 运行所有 E2E 测试
./e2e/run_all_tests

# 运行特定 E2E 测试
./e2e/run_test test_install

# 运行覆盖率
./xtasks/test/coverage

# 性能测试
./xtasks/test/perf
```

有关完整的开发配置和测试流程，请参见[贡献指南](contributing.md)。

这套健壮的测试架构确保了 mise 在复杂功能集上的可靠性，包括工具管理、环境配置、任务执行和多平台支持。

## 相关架构文档

深入了解特定子系统：

- **[任务架构](tasks/architecture.md)** - 任务依赖系统、并行执行引擎和任务发现机制的详细设计
- **[工具源架构](dev-tools/backend_architecture.md)** - 工具源类型、trait 系统以及不同安装方式工作原理的深入指南
