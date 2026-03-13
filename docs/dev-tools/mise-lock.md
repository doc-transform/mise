# mise.lock 锁文件

`mise.lock` 是一个锁文件，用于固定工具的精确版本和校验和，确保环境可复现。启用后，mise 会自动维护此文件，保证不同机器和部署环境中的工具版本一致。

## 概述

锁文件的作用类似于 npm 的 `package-lock.json` 或 Rust 的 `Cargo.lock`：

- **可复现构建**：确保团队中每个人使用完全相同的工具版本
- **安全性**：在工具源支持时通过校验和验证工具完整性
- **版本锁定**：将工具锁定到特定版本，同时在 `mise.toml` 中保持灵活性
- **避免 API 速率限制**：存储下载 URL 后，后续安装直接使用锁文件，无需调用 GitHub（或其他提供商），避免速率限制，大多数情况下不再需要 `GITHUB_TOKEN`

## 启用锁文件

锁文件通过 `lockfile` 设置控制：

```sh
# 全局启用锁文件
mise settings lockfile=true

# 或在 mise.toml 中设置
[settings]
lockfile = true
```

## 工作原理

1. **自动创建**：运行 `mise install` 或 `mise use` 时，mise 会用安装的精确版本更新 `mise.lock`
2. **版本解析**：如果 `mise.lock` 存在，mise 会优先使用锁定版本而非 `mise.toml` 中的版本范围
3. **校验和验证**：对于支持的工具源，mise 会存储并验证下载工具的校验和

## 文件格式

`mise.lock` 是一个 TOML 文件，采用基于平台的格式来组织资源信息：

```toml
# mise.lock 示例
[[tools.node]]
version = "20.11.0"
backend = "core:node"

[tools.node.platforms.linux-x64]
checksum = "sha256:a6c213b7a2c3b8b9c0aaf8d7f5b3a5c8d4e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7"
size = 23456789
url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz"

[[tools.python]]
version = "3.11.7"
backend = "core:python"

[tools.python.platforms.linux-x64]
checksum = "sha256:def456..."
size = 12345678

# 带有工具源特定选项的工具
[[tools.ripgrep]]
version = "14.1.1"
backend = "aqua:BurntSushi/ripgrep"
options = { exe = "rg" }

[tools.ripgrep.platforms.linux-x64]
checksum = "sha256:4cf9f2741e6c465ffdb7c26f38056a59e2a2544b51f7cc128ef28337eeae4d8e"
size = 1234567

# 环境特定版本（仅在 MISE_ENV=test 时使用）
[[tools.tiny]]
version = "2.1.0"
env = ["test"]
```

### 平台信息

工具的 `[tools.name.platforms]` 节中每个平台使用 `"os-arch"` 格式的键（如 `"linux-x64"`、`"macos-arm64"`），可以包含：

- **`checksum`**（可选）：SHA256 或 Blake3 哈希值，用于完整性验证
- **`size`**（可选）：文件大小（字节），用于下载验证
- **`url`**（可选）：原始下载 URL，用于引用或重新下载

### 工具条目字段

每个工具条目（`[[tools.name]]`）可以包含：

- **`version`**（必填）：工具的精确版本
- **`backend`**（可选）：安装工具使用的工具源（如 `core:node`、`aqua:BurntSushi/ripgrep`）
- **`options`**（可选）：用于标识构件的工具源特定选项（如 `{exe = "rg", matching = "musl"}`）
- **`env`**（可选）：此版本适用的环境名列表（如 `["test", "staging"]`）
- **`platforms`**（可选）：平台特定元数据（校验和、URL、文件大小）

### 平台键

平台键格式通常为 `os-arch`，但工具源可以自定义：

- **标准格式**：`linux-x64`、`macos-arm64`、`windows-x64`
- **工具源特定**：某些工具源（如 Java）可能使用更具体的平台标识符
- **工具特定**：`ubi` 等工具源可能在平台键中包含额外的工具特定信息

## 环境特定版本

使用[环境特定配置文件](/configuration/environments)（如 `mise.test.toml`）时，这些文件中的工具会在锁文件中标记 `env` 字段：

```toml
# mise.test.toml
[tools]
tiny = "2"
```

运行 `MISE_ENV=test mise use tiny@2` 后，锁文件将包含：

```toml
[[tools.tiny]]
version = "2.1.0"
env = ["test"]
```

**解析优先级**：解析版本时，mise 按以下顺序检查：

1. 与当前 `MISE_ENV` 匹配的 `env` 条目
2. 基础条目（无 `env` 字段）
3. 第一个可用条目

这样不同环境可以使用不同的工具版本，同时共享同一个锁文件。

## 本地锁文件

在 `mise.local.toml`（通常被 gitignore）中定义的工具使用单独的 `mise.local.lock` 文件。这将本地工具配置与提交的锁文件分开。

```sh
# mise.local.toml 中的工具写入 mise.local.lock
mise use --path mise.local.toml node@22

# 普通 mise.toml 中的工具写入 mise.lock
mise use --path mise.toml node@20
```

使用 `mise lock --local` 为所有平台更新本地锁文件：

```sh
mise lock --local              # 更新 mise.local.lock
mise lock --local node python  # 更新本地锁文件中的特定工具
```

## 严格锁文件模式

`locked` 设置要求所有工具在锁文件中必须有预解析的 URL 才能安装。这防止对 GitHub、aqua 注册表等的 API 调用，确保完全可复现的安装。

```sh
# 启用严格模式
mise settings locked=true

# 或通过环境变量
MISE_LOCKED=1 mise install
```

启用后，如果工具在锁文件中没有当前平台的 URL，`mise install` 会失败。要修复这个问题，先填充锁文件中的 URL：

```sh
mise lock                    # 为所有平台生成 URL
mise lock --platform linux-x64,macos-arm64  # 或特定平台
```

这对于需要保证可复现构建且不依赖外部 API 的 CI 环境非常有用。

## 工作流

### 初始设置

```sh
# 创建锁文件
touch mise.lock

# 安装工具（这会填充锁文件）
mise install
```

### 日常使用

```sh
# 从锁文件安装精确版本
mise install

# 更新工具和锁文件
mise upgrade
```

### 更新版本

需要更新工具版本时：

```sh
# 更新 mise.toml 中的工具版本
mise use node@24

# 这会同时更新安装和 mise.lock
```

## 工具源支持

各工具源对锁文件功能的支持程度不同：

- ✅ **完整支持**（版本 + 校验和 + 大小 + URL）：`aqua`、`http`、`github`、`gitlab`
- ⚠️ **部分支持**（版本 + 校验和 + 大小）：`ubi`
- 📝 **基本支持**（版本 + 校验和）：`core`（部分工具）
- 📝 **仅版本**：`asdf`、`npm`、`cargo`、`pipx`
- 📝 **计划中**：更多工具源将逐步添加完整的资源追踪支持

## 最佳实践

### 版本控制

```sh
# 始终提交锁文件
git add mise.lock
git commit -m "Update tool versions"
```

### 团队协作

1. **团队负责人**：在 `mise.toml` 中更新版本范围
2. **团队负责人**：运行 `mise install` 更新 `mise.lock`
3. **团队负责人**：提交两个文件
4. **团队成员**：拉取更改并运行 `mise install` 获取精确版本

### CI/CD

```yaml
# GitHub Actions 示例
- name: 安装工具
  run: |
    mise install  # 使用 mise.lock 中的精确版本

- name: 缓存锁文件
  uses: actions/cache@v5
  with:
    key: mise-lock-${{ hashFiles('mise.lock') }}
```

## 故障排查

### 重新生成校验和

如果校验和无效或需要重新生成：

```sh
# 卸载所有工具并重新安装
mise uninstall --all
mise install
```

### 锁文件冲突

合并有不同锁文件的分支时：

1. 解决 `mise.lock` 中的冲突
2. 运行 `mise install` 验证一切正常
3. 提交解决后的锁文件

### 为特定项目禁用

```toml
# 在项目的 mise.toml 中
[settings]
lockfile = false
```

## 从其他工具迁移

### 从 asdf 迁移

```sh
# 将 .tool-versions 转换为 mise.toml
mise config generate

# 启用锁文件并填充
mise settings lockfile=true
mise install
```

### 从 package.json engines 迁移

```sh
# 根据 package.json 设置版本
mise use node@$(jq -r '.engines.node' package.json)
```

## 另见

- [配置设置项](/configuration/settings) - 所有可用设置
- [工具版本管理](/dev-tools/) - 工具版本的工作原理
- [工具源](/dev-tools/backends/) - 工具源特定的校验和支持
