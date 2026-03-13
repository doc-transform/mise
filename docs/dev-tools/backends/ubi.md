# Ubi 工具源

::: warning
ubi 工具源**已弃用**。请改用 [github 工具源](/dev-tools/backends/github)。

要迁移，请在配置文件中将 `ubi:owner/repo` 替换为 `github:owner/repo`。
:::

你可以使用 [ubi](https://github.com/houseabsolute/ubi) 工具源直接安装 GitHub Releases 和 URL 包。ubi 已直接编译到 mise 代码中，因此无需单独安装即可使用。

ubi 不需要插件甚至任何工具配置。它的工作原理是尝试从 GitHub releases 推断正确的二进制文件/tarball 并下载合适的版本。只要供应商使用比较标准的发布命名方案，ubi 就能自动识别。

相关代码位于 mise 仓库的 [`./src/backend/ubi.rs`](https://github.com/jdx/mise/blob/main/src/backend/ubi.rs)。

## 用法

以下命令安装最新版本的 goreleaser 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g ubi:goreleaser/goreleaser
$ goreleaser --version
1.25.1
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"ubi:goreleaser/goreleaser" = "latest"
```

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `ubi` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `exe`

`exe` 选项允许你指定归档文件中的可执行文件名。当归档文件包含多个可执行文件时很有用。

如果你遇到类似 `could not find any files named cli in the downloaded zip file` 的错误，可以使用 `exe` 选项指定可执行文件名：

```toml
[tools]
"ubi:cli/cli" = { version = "latest", exe = "gh" } # GitHub 的 CLI
```

### `rename_exe`

`rename_exe` 选项允许你指定提取后的可执行文件名。

使用 `rename_exe` 选项指定目标可执行文件名：

```toml
[tools]
"ubi:cli/cli" = { version = "latest", exe = "gh", rename_exe = "github" } # GitHub 的 CLI
```

### `matching`

当你的 OS/arch 有多个匹配文件时，设置一个字符串来匹配发布文件名，例如 "gnu"、"musl" 或 "msvc"。注意这只在有多个匹配你 OS/arch 的发布文件时才会使用。如果只有一个发布资产匹配你的 OS/arch，此选项将被忽略。

```toml
[tools]
"ubi:BurntSushi/ripgrep" = { version = "latest", matching = "musl" }
```

### `matching_regex`

设置一个正则表达式，在匹配 OS/arch 之前先对发布文件名进行匹配。如果模式只产生一个匹配，则选择该发布。如果没有匹配则会报错。

```toml
[tools]
"ubi:shader-slang/slang" = { version = "latest", matching_regex = "\\d+\\.tar" }
```

### `provider`

设置用于获取资产和发布信息的提供商类型。可选 `github` 或 `gitlab`（默认为 `github`）。
如果你使用了 `api_url`，请确保将 `provider` 设置为正确的类型，因为可能无法从 URL 正确推断类型。

```toml
[tools]
"ubi:gitlab-org/cli" = { version = "latest", exe = "glab", provider = "gitlab" }
```

### `api_url`

设置提供商 API 的 URL。在使用自托管实例时很有用。

```toml
[tools]
"ubi:acme/my-tool" = {
  version = "latest",
  provider = "gitlab",
  api_url = "https://gitlab.acme.com/api/v4",
}
```

### `extract_all`

设为 `true` 以提取 tarball 中的所有文件，而不仅仅是 "bin"。不兼容 `exe` 和 `rename_exe`。

```toml
[tools]
"ubi:helix-editor/helix" = { version = "latest", extract_all = "true" }
```

### `bin_path`

tarball 中二进制文件所在的目录。当二进制文件不在 tarball 根目录时很有用。
此选项仅在 `extract_all` 设为 `true` 时有意义。

```toml
[tools]
"ubi:BurntSushi/ripgrep" = {
  version = "latest",
  extract_all = "true",
  bin_path = "target/release",
}
```

**二进制路径查找顺序：**

1. 如果指定了 `bin_path`，使用该目录
2. 如果 `extract_all` 设为 `true`，使用安装路径根目录
3. 如果未设置 `bin_path`，在安装路径中查找 `bin/` 目录
4. 如果不存在 `bin/` 目录，使用解压目录的根目录

### `tag_regex`

设置正则表达式来过滤不匹配的标签。当供应商在同一仓库中有大量不相关 CLI 的发布时很有用。例如，`cargo-bins/cargo-binstall` 有大量与 cargo-binstall 无关的 CLI 发布。此选项可以过滤掉这些发布。

```toml
[tools]
"ubi:cargo-bins/cargo-binstall" = { version = "latest", tag_regex = '^\d+\.' }
```

## 自托管 GitHub/GitLab

如果你使用自托管的 GitHub/GitLab 实例，可以设置 `provider` 和 `api_url` 工具选项。
此外，你可以设置 `MISE_GITHUB_ENTERPRISE_TOKEN` 或 `MISE_GITLAB_ENTERPRISE_TOKEN` 环境变量来进行 API 认证。

## 支持的 Ubi 语法

- **GitHub 简写（最新发布版本）：**`ubi:goreleaser/goreleaser`
- **GitHub 简写（指定发布版本）：**`ubi:goreleaser/goreleaser@1.25.1`
- **URL 语法：**`ubi:https://github.com/goreleaser/goreleaser/releases/download/v1.16.2/goreleaser_Darwin_arm64.tar.gz`

## ubi 故障排查

### `ubi` 解析器无法识别 os/arch

有时供应商使用奇怪的发布格式，导致 ubi 无法识别，可能是特定 os/arch 组合的问题。例如最近在[这个工单](https://github.com/houseabsolute/ubi/issues/79)中出现，因为供应商使用了 "mac" 而非更常见的 "macos" 或 "darwin" 标签。

尝试单独使用 ubi 来判断问题是出在 mise 还是 ubi：

```sh
ubi -p jdx/mise
./bin/mise -v # 是的，这意味着你技术上可以执行 `mise use ubi:jdx/mise`，虽然我不知道你为什么要这么做
```

### `ubi` 选错了 tarball

另一个问题是 GitHub 发布可能有大量 tarball，其中一些不包含你想要的 CLI，你可以使用 `matching` 字段指定一个字符串来匹配发布文件。

```sh
mise use ubi:tamasfe/taplo[matching=full]
# 或直接使用 ubi
ubi -p tamasfe/taplo -m full
```

### `ubi` 在 tarball 中找不到二进制文件

ubi 假设仓库名称与二进制文件名相同，但实际情况往往不是这样。例如，BurntSushi/ripgrep 给出的二进制文件名是 `rg` 而不是 `ripgrep`。在这种情况下，你可以使用 `exe` 字段指定二进制文件名：

```sh
mise use ubi:BurntSushi/ripgrep[exe=rg]
# 或直接使用 ubi
ubi -p BurntSushi/ripgrep -e rg
```

### `ubi` 使用了奇怪的版本

这个问题实际上出在 mise 而非 ubi。mise 需要能够列出工具的可用版本，以便 "latest" 指向 CLI 的实际最新发布。有时供应商会有不相关的 GitHub releases。例如，`cargo-bins/cargo-binstall` 是 cargo-binstall 的仓库，但它有大量与 cargo-binstall 无关的 CLI 发布。我们需要过滤掉这些，这可以通过 `tag_regex` 工具选项指定：

```sh
mise use 'ubi:cargo-bins/cargo-binstall[tag_regex=^\d+\.]'
```

现在运行 `mise ls-remote ubi:cargo-bins/cargo-binstall[tag_regex=^\d+\.]` 时你应该只能看到以数字开头的版本。注意此命令有缓存，你可能需要先运行 `mise cache clear`。
