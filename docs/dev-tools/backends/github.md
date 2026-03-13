# GitHub 工具源

你可以使用 `github` 工具源直接安装 GitHub 发布资产。此工具源从 GitHub 仓库下载发布资产，非常适合通过 GitHub 发布分发预构建二进制文件的工具。

相关代码位于 mise 仓库的 [`./src/backend/github.rs`](https://github.com/jdx/mise/blob/main/src/backend/github.rs)。

## 用法

以下命令从 GitHub 发布安装最新版本的 ripgrep 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g github:BurntSushi/ripgrep
$ rg --version
ripgrep 14.1.1
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"github:BurntSushi/ripgrep" = "latest"
```

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `github` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### 资产自动检测

未指定 `asset_pattern` 时，mise 会自动为你的平台选择最佳资产。系统根据以下因素对资产进行评分：

- **操作系统兼容性**（linux、macos、windows）
- **架构兼容性**（x64、arm64、x86、arm）
- **libc 变体**（Linux 的 gnu 或 musl，Windows 的 msvc）
- **归档格式偏好**（tar.gz、zip 等）
- **构建类型**（排除 debug/test 构建）

对于大多数工具，你可以直接安装而无需指定模式：

```sh
mise install github:user/repo
```

::: tip
自动检测逻辑实现在 [`src/backend/asset_matcher.rs`](https://github.com/jdx/mise/blob/main/src/backend/asset_matcher.rs)，GitHub 和 GitLab 工具源共享此逻辑。
:::

### `asset_pattern`

指定用于匹配发布资产名称的模式。当你的 OS/arch 组合有多个资产或需要覆盖自动检测时很有用。

```toml
[tools]
"github:cli/cli" = { version = "latest", asset_pattern = "gh_*_linux_x64.tar.gz" }
```

### `version_prefix`

指定发布标签的自定义版本前缀。默认情况下，mise 处理常见的 `v` 前缀（如 `v1.0.0`），但某些仓库使用不同的前缀，如 `release-`、`version-` 或无前缀。

配置 `version_prefix` 后，mise 会：

- 使用前缀过滤可用版本并去除前缀
- 搜索发布时添加前缀
- 安装时尝试带前缀和不带前缀的版本

```toml
[tools]
"github:user/repo" = { version = "latest", version_prefix = "release-" }
```

**示例：**

- 设置 `version_prefix = "release-"` 时：
  - 用户指定 `1.0.0` → mise 搜索 `release-1.0.0` 标签
  - 可用版本显示为 `1.0.0`（前缀被去除）
- 设置 `version_prefix = ""`（空字符串）时：
  - 用户指定 `1.0.0` → mise 搜索 `1.0.0` 标签（无前缀）
  - 适用于不使用任何前缀的仓库

### 特定平台的资产模式

为不同平台指定不同的资产模式：

```toml
[tools."github:cli/cli"]
version = "latest"

[tools."github:cli/cli".platforms]
linux-x64 = { asset_pattern = "gh_*_linux_x64.tar.gz" }
macos-arm64 = { asset_pattern = "gh_*_macOS_arm64.tar.gz" }
```

### `checksum`

使用校验和验证下载的文件：

```toml
[tools."github:owner/repo"]
version = "1.0.0"
asset_pattern = "tool-1.0.0-x64.tar.gz"
checksum = "sha256:a1b2c3d4e5f6789..."
```

_你也可以使用 [mise.lock](/dev-tools/mise-lock) 来管理校验和，而不是在此处指定。_

### 特定平台的校验和

```toml
[tools."github:cli/cli"]
version = "latest"

[tools."github:cli/cli".platforms]
linux-x64 = {
  asset_pattern = "gh_*_linux_x64.tar.gz",
  checksum = "sha256:a1b2c3d4e5f6789...",
}
macos-arm64 = {
  asset_pattern = "gh_*_macOS_arm64.tar.gz",
  checksum = "sha256:b2c3d4e5f6789...",
}
```

### `size`

验证下载资产的大小：

```toml
[tools]
"github:cli/cli" = { version = "latest", size = "12345678" }
```

### `strip_components`

解压归档文件时要去除的目录层级数：

```toml
[tools]
"github:cli/cli" = { version = "latest", strip_components = 1 }
```

::: info
如果未显式设置 `strip_components`，当解压的归档文件根目录下只有一个目录而没有文件时，mise 会自动应用 `strip_components = 1`。这在工具将二进制文件打包在版本目录中时很常见（如 `ripgrep-14.1.0-x86_64-unknown-linux-musl/rg`）。自动检测确保二进制文件被放置在 mise 期望的安装路径中。
:::

### `bin`

将下载的二进制文件重命名为特定名称。当下载的单个二进制文件有特定于平台的名称时很有用：

```toml
[tools."github:docker/compose"]
version = "2.29.1"
bin = "docker-compose"  # 将下载的二进制文件重命名为 docker-compose
```

::: info
下载单个二进制文件（非归档文件）时，mise 会自动去除文件名中的 OS/arch 后缀。例如，`docker-compose-linux-x86_64` 会自动变为 `docker-compose`。仅在需要特定自定义名称时才使用 `bin` 选项。
:::

### `rename_exe`

从归档文件中提取后重命名可执行文件。当归档文件中的二进制文件有特定于平台的名称且你想要重命名时很有用：

```toml
[tools."github:yt-dlp/yt-dlp"]
version = "latest"
asset_pattern = "yt-dlp_linux.zip"
rename_exe = "yt-dlp"  # 将提取的二进制文件重命名为 yt-dlp
```

::: tip
对于归档文件中二进制文件名称与期望不同的情况使用 `rename_exe`。对于单个二进制文件下载（非归档文件）使用 `bin`。
:::

### `no_app`

在自动检测时跳过 macOS .app 包资产，优先选择独立的 CLI 二进制文件。当仓库同时提供 macOS .app 包（通常是 Xcode 扩展或 GUI 应用）和独立命令行工具时很有用：

```toml
[tools."github:nicklockwood/SwiftFormat"]
version = "latest"
rename_exe = "swiftformat"
no_app = true  # 跳过 SwiftFormat.for.Xcode.app.zip，使用 swiftformat.zip
```

启用 `no_app = true` 后：

- 包含 `.app.` 的资产（如 `Tool.app.zip`、`Tool.for.Xcode.app.zip`）在自动检测中会被降权
- 独立归档文件（如 `tool.zip`、`tool-macos.tar.gz`）会被优先选择
- 仅影响 macOS；对 Linux/Windows 无效

::: info
不使用此选项时，mise 的自动检测在 macOS 上可能会选择 .app 包，如果包中是 GUI 应用或 Xcode 扩展而非独立 CLI 工具，就会产生问题。
:::

### `bin_path`

指定解压归档文件中包含二进制文件的目录，或下载文件的放置位置。支持 Tera 模板变量，如 `{{ version }}`、`{{ os }}`、`{{ arch }}`，以及架构别名（`{{ darwin_os }}`、`{{ amd64_arch }}`、`{{ x86_64_arch }}`、`{{ gnu_arch }}`）：

```toml
[tools."github:cli/cli"]
version = "latest"
bin_path = "cli-{{ version }}/bin" # 展开为 cli-1.0.0/bin
```

**二进制路径查找顺序：**

1. 如果指定了 `bin_path`，使用该目录
2. 如果未设置 `bin_path`，在安装路径中查找 `bin/` 目录
3. 如果安装路径根目录包含可执行文件，使用安装路径根目录
4. 如果不存在 `bin/` 目录，在子目录中搜索 `bin/` 目录
5. 如果未找到 `bin/` 目录，搜索直接子目录中的任何可执行文件。如果在子目录中直接找到可执行文件，则将该子目录视为二进制路径
6. 如果未找到可执行文件，使用解压目录的根目录

### `filter_bins`

以逗号分隔的二进制文件列表，用于创建过滤的 `.mise-bins` 目录的符号链接。当工具附带你不想暴露在 PATH 中的额外二进制文件时很有用。

```toml
[tools]
"github:jgm/pandoc" = { version = "latest", filter_bins = "pandoc" }
```

启用后：

- 创建一个 `.mise-bins` 子目录，其中只包含指向指定二进制文件的符号链接
- 其他二进制文件（如 `pandoc-lua` 或 `pandoc-server`）不会暴露在 PATH 中

### `api_url`

对于 GitHub Enterprise 或自托管的 GitHub 实例，指定 API URL：

```toml
[tools]
"github:myorg/mytool" = { version = "latest", api_url = "https://github.mycompany.com/api/v3" }
```

## 自托管 GitHub

如果你使用自托管的 GitHub 实例，设置 `api_url` 工具选项，并可选地设置 `MISE_GITHUB_ENTERPRISE_TOKEN` 环境变量用于认证：

```sh
export MISE_GITHUB_ENTERPRISE_TOKEN="your-token"
```

## 支持的 GitHub 语法

- **GitHub 简写（最新发布版本）：**`github:cli/cli`
- **GitHub 简写（指定发布版本）：**`github:cli/cli@2.40.1`

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="github" :level="3" />
