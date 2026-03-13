# SPM 工具源 <Badge type="warning" text="experimental" />

你可以直接从 GitHub 或 GitLab 发布安装由 [Swift Package Manager](https://www.swift.org/documentation/package-manager) 管理的可执行文件。

相关代码位于 mise 仓库的 [`./src/backend/spm.rs`](https://github.com/jdx/mise/blob/main/src/backend/spm.rs)。

## 依赖

需要先安装 `swift`。你可以[手动安装](https://www.swift.org/install)或[通过 mise 安装](/lang/swift)。

> [!NOTE]
> 如果你已安装 Xcode 并通过 `xcode-select` 在系统中选定，Swift 已经通过 Xcode 内嵌的工具链可用。

## 用法

以下命令安装最新版本的 `tuist` 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g spm:tuist/tuist
$ tuist --help
OVERVIEW: Generate, build and test your Xcode projects.

USAGE: tuist <subcommand>
...
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"spm:tuist/tuist" = "latest"
```

### 支持的语法

| 描述                             | 用法                                            |
| -------------------------------- | ----------------------------------------------- |
| GitHub 简写（最新发布版本）      | `spm:tuist/tuist`                               |
| GitHub 简写（指定发布版本）      | `spm:tuist/tuist@4.15.0`                        |
| GitHub URL（最新发布版本）       | `spm:https://github.com/tuist/tuist.git`        |
| GitHub URL（指定发布版本）       | `spm:https://github.com/tuist/tuist.git@4.15.0` |

其他语法可能可用，但不受支持且未经测试。

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于此工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `provider`

设置用于获取资产和发布信息的提供商类型。可选 `github` 或 `gitlab`（默认为 `github`）。
如果你使用简写表示法和 `api_url` 指向自托管仓库，请确保将 `provider` 设置为正确的类型，因为可能无法从 URL 正确推断类型。

```toml
[tools]
"spm:patricklorran/ios-settings" = { version = "latest", provider = "gitlab" }
```

### `api_url`

设置提供商 API 的 URL。在使用自托管实例时很有用。

```toml
[tools]
"spm:acme/my-tool" = { version = "latest", provider = "gitlab", api_url = "https://gitlab.acme.com/api/v4" }
```
