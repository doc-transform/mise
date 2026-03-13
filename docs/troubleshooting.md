# 故障排查

## `mise activate` 在 `~/.profile`、`~/.bash_profile`、`~/.zprofile` 中不生效

`mise activate` 只应在 `rc` 文件中使用。这些是用户在终端中交互时使用的文件（与被 IDE 等执行的场景不同）。非交互式环境中不会显示提示符，因此 PATH 不会被修改。

对于非交互式场景，建议改用 shims，它会在每次执行时通过检查 `PWD` 来路由调用到正确的目录。你也可以直接调用 `mise exec`，而不是期望工具直接在 PATH 中。你也可以在非交互式 shell 中运行 `mise env`，但这只会配置全局工具，进入不同项目时不会修改环境变量。

::: warning
`mise activate --shims` 不支持 `mise activate` 的所有功能。<br>
详见 [shims vs path](/dev-tools/shims.html#shims-vs-path)。
:::

另外参见 [shebang](/tips-and-tricks#shebang) 示例，了解如何让脚本调用 mise 来获取运行时。这是另一种不需要激活 mise 就能使用的方式。

## mise 无法正常工作

首先尝试设置 `MISE_DEBUG=1` 或 `MISE_TRACE=1`，看看是否能获得更多信息。你也可以设置 `MISE_LOG_FILE_LEVEL=debug MISE_LOG_FILE=/path/to/logfile` 将日志写入文件。

如果问题出在激活钩子上，可以尝试禁用它并手动调用 `eval "$(mise hook-env)"`。使用 `mise env` 也有帮助，它只会输出将要设置的环境变量。也可以考虑使用 [shims](/dev-tools/shims.md)，兼容性可能更好。

如果工具安装不正常，尝试使用 `--raw` 标志，它会串行安装并将 stdin/stdout/stderr 直接连接到终端。如果插件因为某种原因需要与你交互，这个标志可以使其正常工作。

当然要用 `mise --version` 检查 mise 版本，确保是最新的。使用 `mise self-update` 来更新。`mise cache clean` 可以清除内部缓存，`mise implode` 可以移除除配置以外的所有内容。

最后，还有 `mise doctor`，它会显示诊断信息和检测到的配置问题警告。如果你提交 bug 报告，请包含 `mise doctor` 的输出。

## 使用了错误版本的工具

这通常意味着 mise 不在 PATH 的最前面——无论是使用 shims 还是 `mise activate`。你可以通过 `which -a` 来验证，例如，如果正在使用 node@20.0.0 但 mise 指定了 node@24.0.0，首先通过运行 `mise ls node` 确保 mise 安装了这个版本并且是激活状态。它不应该显示 missing，并且应该有正确的 "Requested" 版本：

```bash
$ mise ls node
Plugin  Version  Config Source       Requested
node    24.0.0  ~/.mise/config.toml  24.0.0
```

如果 `node -v` 没有显示正确版本，通过运行 `mise doctor` 确认 mise 已激活。它不应该列出关于 mise 未激活的"问题"。最后运行 `which -a node`。如果列出的目录不是 mise 的目录，那么 mise 不在 PATH 的最前面。先被执行的那个 node 所在的目录需要设置在 mise 之后。通常这意味着在 bashrc/zshrc 的末尾设置 mise shims 的 PATH。

如果使用 `mise activate`，你还有另一个选择：启用 `MISE_ACTIVATE_AGGRESSIVE=1`，这会让 mise 始终将其工具路径放在 PATH 最前面。如果你使用了其他也像 `mise activate` 一样动态修改路径的工具，这可能不起作用，因为其他工具可能在 mise 之后修改了 PATH。

如果以上都不行，你可以用 [`mise x --`](/cli/exec) 来运行命令，以确保使用的是正确版本。

## 新版本的工具没有出现

版本缓存在两个地方，所以全新的发布可能不会立即出现。

第一个是 mise CLI 的版本缓存。可以用 `mise cache clear` 清除缓存。

第二个是使用 <https://mise-versions.jdx.dev> 作为集中式的版本列表托管。这是为了加速 mise 运行，同时避免查询新版本时触发 GitHub 速率限制。查看该仓库中对应的插件，看看是否有更新的版本。可以通过设置 `MISE_USE_VERSIONS_HOST=0` 来禁用此服务。

mise-versions 本身也会受到速率限制，但你可以通过其 [GitHub app](https://github.com/apps/mise-versions) 进行认证来帮助它更频繁地获取。它不需要任何权限，因为它只获取公开的仓库信息。越多人这样做，mise 就能越快获取到工具的新版本。

## Windows 相关问题

::: warning
Windows 目前只有基础支持。由于 Windows 无法支持 asdf 插件，只能使用 core 和 vfox——这意味着 Windows 上只有少量工具可用。
:::

### 路径长度限制

如果你在 `mise.toml` 层级中定义了很多工具，`mise x` 生成的 `Path` 环境变量可能会过长，某些工具无法处理，尤其是 `cmd.exe`。这会影响调用 `cmd.exe` 的 mise 工具（比如 `npm install`）。

你有以下几个选择：

1. 将 `MISE_INSTALLS_DIR` 环境变量设置为更短的路径，例如 `C:\.mise-installs`。
1. 使用 `powershell.exe` 或 `pwsh.exe` 代替 `cmd.exe`，因为它们能处理更长的 `Path`。
1. 重新组织 monorepo 中的 `mise.toml` 文件，只指定它们需要的工具。

你可以运行以下命令测试是否遇到了 `cmd.exe` 的 `Path` 限制：

```powershell
# Path 在限制范围内
❯ mise x -- cmd.exe /d /s /c "where.exe where"
C:\Windows\System32\where.exe
# Path 超出了 cmd.exe 的限制
❯ mise x -- cmd.exe /d /s /c "where.exe where"
'where.exe' is not recognized as an internal or external command,
operable program or batch file.
mise ERROR command failed: exit code 1
mise ERROR Run with --verbose or MISE_VERBOSE=1 for more information
```

## 在 tmux 或其他 shell 初始化脚本中调用 mise 不生效

`mise activate` 在 shell 提示符显示之前不会更新 PATH。因此如果你需要在提示符显示之前访问 mise 提供的工具，可以[将 shims 添加到 PATH](/dev-tools/shims.html#how-to-add-mise-shims-to-path)，例如：

```bash
export PATH="$HOME/.local/share/mise/shims:$PATH"
python --version # 添加 shims 到 PATH 后即可使用
```

或者你可以手动调用 `hook-env`：

```bash
eval "$(mise activate bash)"
eval "$(mise hook-env)"
python --version # 只有在显式调用 hook-env 后才能使用
```

更多信息请参见 [`mise activate` 做了什么？](/faq#what-does-mise-activate-do)

## mise 安全吗？

提供安全的供应链至关重要。与 asdf 相比，mise 已经提供了更安全的使用体验。欢迎安全方面的评估和贡献。我们也敦促用户关注所使用的插件安全性，敦促插件作者保护用户安全。

更多详情请参阅 [SECURITY.md](https://github.com/jdx/mise/blob/main/SECURITY.md)。

## 安装工具时遇到 403 Forbidden

你可能会看到类似以下的错误：

```text
HTTP status client error (403 Forbidden) for url
403 API rate limit exceeded for
```

如果工具托管在 GitHub 上，且你达到了 API 速率限制，就会发生这种情况。这在 GitHub Actions 等 CI 环境中尤其常见。如果没有设置 `GITHUB_TOKEN`，速率限制会非常低。你可以到 [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new?description=MISE_GITHUB_TOKEN) 创建一个 GitHub token（不需要任何权限范围），然后设置为环境变量。可以使用以下任一变量（按优先级排序）：

- `MISE_GITHUB_TOKEN`
- `GITHUB_TOKEN`
- `GITHUB_API_TOKEN`

## 命令未找到时的自动安装功能对新工具不生效

如果你期望 mise 在运行未找到的命令时自动安装工具（使用 [`not_found_auto_install`](/configuration/settings.html#not_found_auto_install) 功能），请注意一个重要的限制：

**mise 只能自动安装已经至少安装了一个版本的工具的缺失版本。**

这是因为除非已经有一个已安装（即使是未激活的）版本，mise 无法知道某个工具会提供哪些可执行文件。如果你从未安装过某个工具的任何版本，mise 就无法确定哪个工具负责某个可执行文件名称，因此无法按需自动安装。

**解决方法：**

- 手动安装至少一个版本的目标工具。之后，自动安装功能就能正常工作了。
- 使用 [`mise x|exec`](/cli/exec) 或 [`mise r|run`](/cli/run) 来触发缺失工具的自动安装，即使当前没有安装任何版本。这些命令会自动尝试安装所需的工具版本。
