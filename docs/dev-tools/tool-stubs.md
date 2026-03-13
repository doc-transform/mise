# 工具桩（Tool Stubs）

工具桩允许你创建内嵌 TOML 配置的可执行文件来执行工具。它们提供了一种便捷方式，直接在可执行脚本中定义工具版本、工具源和执行参数。它们也是让 mise 中的工具延迟加载的好方法——工具只在被调用时才获取，而不是在运行 `mise install` 时。

此功能受 [dotslash](https://github.com/facebook/dotslash) 启发，该项目首创了内嵌配置的可执行文件概念，实现便携式工具执行。

## 概述

工具桩是一个以 shebang 行 `mise tool-stub` 开头的可执行文件，包含指定要执行哪个工具及如何执行的 TOML 配置。运行工具桩时，mise 会自动安装指定的工具版本（如需），然后用提供的参数执行它。

工具桩可以使用任何 mise 工具源，但默认使用 http——由于 http 工具源的工具有 URL 等属性且不需要版本号，http 工具桩看起来与非 http 工具桩略有不同。

::: tip
工具桩特别适合将不常用的工具添加到 mise 配置中。由于工具只在工具桩首次执行时才安装，你可以定义很多工具而不需要预先全部安装。非常适合专用工具、测试工具或不常使用的项目专用二进制文件。
:::

## 普通工具桩（非 http）

```bash
#!/usr/bin/env -S mise tool-stub
# 描述工具的可选注释

version = "1.0.0"
tool = "python"
bin = "python"
```

::: info 为什么使用 `env -S`？
`-S` 标志告诉 `env` 按空格分割命令行，允许向解释器传递多个参数。这是必要的，因为 Unix 系统上的 shebang 传统上只支持解释器路径后的一个参数。使用 `env -S mise tool-stub` 可以将其正确分割为 `env` → `mise` → `tool-stub`。
:::

## 配置字段

工具桩配置本质上是 `mise.toml` 的 [tools] 节中功能的子集，额外增加了 `tool` 字段来指定使用哪个工具。`mise.toml` 中工具配置的所有选项在工具桩中都支持。

### 可选字段

- `tool` - 显式指定工具名称或工具源（如 "python"、"github:cli/cli"）。这是工具桩独有的字段——指定使用配置中的哪个工具条目。如果省略且存在 `url` 字段，则默认使用 HTTP 工具源。
- `version` - 使用的工具版本
- `bin` - 工具中要执行的二进制文件名（默认为工具桩的文件名）

## HTTP 工具桩

多平台压缩包：

```toml
#!/usr/bin/env -S mise tool-stub
url = "https://example.com/releases/1.0.0/tool-linux-x64.tar.gz"
```

平台特定压缩包：

```toml
#!/usr/bin/env -S mise tool-stub
[platforms.linux-x64]
url = "https://example.com/releases/1.0.0/tool-linux-x64.tar.gz"

[platforms.darwin-arm64]
url = "https://example.com/releases/1.0.0/tool-macos-arm64.tar.gz"
```

### 平台特定二进制路径

不同平台可能有不同的二进制结构或名称。当平台之间二进制路径不同时，可以指定平台特定的 `bin` 字段：

```toml
#!/usr/bin/env -S mise tool-stub
# 全局 bin 字段，在平台结构相同时使用
bin = "bin/tool"

[platforms.linux-x64]
url = "https://example.com/tool-linux.tar.gz"
# 使用全局 bin 字段: "bin/tool"

[platforms.windows-x64]
url = "https://example.com/tool-windows.zip"
bin = "tool.exe"  # Windows 的平台特定二进制文件
```

工具桩生成器会自动检测平台间二进制路径是否不同，在需要时生成平台特定的 `bin` 字段，在所有平台结构相同时使用全局 `bin` 字段。

::: tip
如果没有 `tool` 字段但存在 `url` 字段，工具桩默认使用 HTTP 工具源。详见 [HTTP 工具源文档](/dev-tools/backends/http)。
:::

## 生成工具桩（http）

虽然你可以手动编写 TOML 配置创建工具桩，mise 提供了 [`mise generate tool-stub`](/cli/generate/tool-stub) 命令来自动创建基于 HTTP 的工具桩。

::: tip 增量构建
使用平台特定 URL 时，工具桩生成器会向已有的桩文件追加新平台而非覆盖。这允许你通过多次运行命令（针对不同平台）来逐步构建跨平台工具桩。
:::

### 基本生成

为通过 HTTP 分发的工具生成工具桩：

```bash
mise generate tool-stub ./bin/gh --url "https://github.com/cli/cli/releases/download/v2.336.0/gh_2.336.0_linux_amd64.tar.gz"
```

这会：

- 下载压缩包以检测校验和（安全目的）
- 解压以自动检测二进制路径
- 生成包含完整 TOML 配置的可执行工具桩

### 平台特定生成

对于不同平台有不同 URL 的工具，可以一次性生成所有平台：

```bash
mise generate tool-stub ./bin/rg \
  --platform-url linux-x64:https://github.com/BurntSushi/ripgrep/releases/download/14.0.3/ripgrep-14.0.3-x86_64-unknown-linux-musl.tar.gz \
  --platform-url darwin-arm64:https://github.com/BurntSushi/ripgrep/releases/download/14.0.3/ripgrep-14.0.3-aarch64-apple-darwin.tar.gz
```

**自动平台检测**：如果 URL 中包含平台信息，可以省略平台前缀让 mise 自动检测：

```bash
# 从 URL 自动检测平台（检测为 'macos-arm64'）
mise generate tool-stub ./bin/node \
  --platform-url https://nodejs.org/dist/v22.17.1/node-v22.17.1-darwin-arm64.tar.gz

# 从 URL 自动检测平台（检测为 'linux-x64'）
mise generate tool-stub ./bin/node \
  --platform-url https://github.com/BurntSushi/ripgrep/releases/download/14.0.3/ripgrep-14.0.3-x86_64-unknown-linux-musl.tar.gz
```

也可以逐步添加平台：

```bash
# 先添加 Linux 支持（显式指定平台）
mise generate tool-stub ./bin/rg \
  --platform-url linux-x64:https://github.com/BurntSushi/ripgrep/releases/download/14.0.3/ripgrep-14.0.3-x86_64-unknown-linux-musl.tar.gz

# 之后用自动检测添加 macOS 支持（追加到已有文件）
mise generate tool-stub ./bin/rg \
  --platform-url https://github.com/BurntSushi/ripgrep/releases/download/14.0.3/ripgrep-14.0.3-aarch64-apple-darwin.tar.gz

# 用自动检测添加 Windows 支持（追加到已有文件）
mise generate tool-stub ./bin/rg \
  --platform-url https://github.com/BurntSushi/ripgrep/releases/download/14.0.3/ripgrep-14.0.3-x86_64-pc-windows-msvc.zip
```

生成器会保留已有配置并将新平台合并到 `[platforms]` 表中。如果指定了已存在的平台，其 URL 会被更新。

### 生成选项

- `--version VERSION` - 指定工具版本（默认为 "latest"）
- `--bin PATH` - 覆盖自动检测的二进制路径
- `--platform-url PLATFORM:URL` - 添加平台特定 URL（可多次使用）
- `--platform-url URL` - 从 URL 文件名自动检测平台并添加
- `--platform-bin PLATFORM:PATH` - 设置平台特定二进制路径
- `--skip-download` - 跳过下载以加快生成速度（无校验和或二进制检测）
- `--lock` - 解析并将锁文件数据（固定版本 + 平台 URL/校验和）嵌入现有工具桩

### 支持的压缩格式

生成器自动检测并解压各种压缩格式：

- `.tar.gz` / `.tgz`（gzip 压缩）
- `.tar.xz` / `.txz`（xz 压缩）
- `.tar.bz2` / `.tbz2`（bzip2 压缩）
- `.tar.zst` / `.tzst`（zstd 压缩）
- `.zip`（zip 压缩）
- `.7z`（7-zip 压缩，仅 Windows）

### 生成的工具桩示例

运行生成命令会产生如下可执行工具桩：

```bash
#!/usr/bin/env -S mise tool-stub

version = "latest"
bin = "bin/gh"
url = "https://github.com/cli/cli/releases/download/v2.336.0/gh_2.336.0_linux_amd64.tar.gz"
checksum = "blake3:a1b2c3d4e5f6..."
size = 12345678
```

生成器会自动：

- 计算 BLAKE3 校验和用于完整性验证
- 检测文件大小
- 识别压缩包内正确的二进制路径
- 使用输出文件名作为工具名

## 示例

### 基本 Node.js 工具桩

```bash
#!/usr/bin/env -S mise tool-stub
# Node.js v20 工具桩

tool = "node"
version = "20.0.0"
bin = "node"
```

### 自定义二进制名的 Python

```bash
#!/usr/bin/env -S mise tool-stub
# Python 工具，可通过 'py' 访问

tool = "python"
version = "3.11"
bin = "python"
```

### GitHub Release 工具源

```bash
#!/usr/bin/env -S mise tool-stub
# GitHub CLI 工具

tool = "github:cli/cli"
version = "latest"
```

### 锁定的工具桩

```bash
#!/usr/bin/env -S mise tool-stub

tool = "node"
version = "20.18.1"
bin = "node"

[lock.platforms.linux-x64]
url = "https://nodejs.org/dist/v20.18.1/node-v20.18.1-linux-x64.tar.xz"
checksum = "sha256:abc123..."

[lock.platforms.macos-arm64]
url = "https://nodejs.org/dist/v20.18.1/node-v20.18.1-darwin-arm64.tar.gz"
checksum = "sha256:def456..."
```

`[lock]` 节由 `mise generate tool-stub --lock` 生成，提供带校验和验证的可复现下载。tool/version 字段仍用于工具源解析，lock 数据提供下载快捷方式。

::: tip
锁定功能对于避免 GitHub API 速率限制特别有用，尤其是用户没有设置 `GITHUB_TOKEN` 时。有了锁定的工具桩，安装工具时不需要任何 API 调用。
:::

#### 锁定工具桩

```bash
# 创建一个模糊版本的工具桩
mise generate tool-stub ./bin/node --version 20

# 锁定它以固定精确版本并添加平台 URL/校验和
mise generate tool-stub ./bin/node --lock
```

这会解析版本，获取所有常用平台（linux-x64、linux-arm64、macos-x64、macos-arm64、windows-x64）的 URL，并写入工具桩的 `[lock]` 节。

#### 升级锁定版本

要升级锁定工具桩的版本，同时传递 `--version` 和 `--lock`：

```bash
# 升级到最新的 node 22.x 并重新锁定
mise generate tool-stub ./bin/node --lock --version 22
```

### HTTP 工具源多平台支持

```bash
#!/usr/bin/env -S mise tool-stub
# 支持多平台下载的自定义 HTTP 工具

version = "1.0.0"

[platforms.linux-x64]
url = "https://releases.example.com/v{{version}}/tool-linux-x64.tar.gz"

[platforms.darwin-arm64]
url = "https://releases.example.com/v{{version}}/tool-macos-arm64.tar.gz"
```

## 使用方法

### 直接执行

设置工具桩为可执行并直接运行：

```bash
chmod +x ./bin/my-tool
./bin/my-tool --version
```

### 通过 mise 命令

使用 [`mise tool-stub`](/cli/tool-stub) 命令执行——在排查问题时很有用：

```bash
mise tool-stub ./bin/my-tool --version
```

## 缓存

工具桩实现了智能缓存，减少 mise 运行工具桩时的开销：

- 二进制路径根据工具桩文件路径和修改时间缓存
- 工具桩文件变化时缓存自动失效
- 缺失的二进制文件会自动触发缓存清理

缓存后的工具桩开销约 4ms。

## 替代方案：用 `mise x` 创建简单工具桩

对于基本用途，你可以用 [`mise x`](/cli/exec) 命令快速创建简单的工具桩，无需手动编写 TOML 配置：

```bash
# 创建 bin 目录
mkdir -p ./bin

# 创建简单的 Node.js 工具桩
cat > ./bin/node << 'EOF'
#!/usr/bin/env bash
exec mise x node@20 -- "$@"
EOF
chmod +x ./bin/node

# 创建指定版本的 Python 工具桩
cat > ./bin/python << 'EOF'
#!/usr/bin/env bash
exec mise x python@3.11 -- "$@"
EOF
chmod +x ./bin/python
```

这种方式适合简单的工具执行，无需自定义选项、环境变量或平台特定设置。对于更复杂的配置，请使用上述完整的 TOML 配置格式。
