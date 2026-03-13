# 目录结构

以下是 mise 使用的目录。

::: tip
如果你经常需要访问这些目录（像我一样），建议将所有目录统一设置为 `~/.mise` 以方便访问。
:::

## `~/.config/mise`

- 覆盖方式：`$MISE_CONFIG_DIR`
- 默认值：`${XDG_CONFIG_HOME:-$HOME/.config}/mise`

此目录存储全局配置文件 `~/.config/mise/config.toml`。建议将其放入 dotfiles 仓库以便在多台机器间共享。

## `~/.cache/mise`

- 覆盖方式：`$MISE_CACHE_DIR`
- 默认值：`${XDG_CACHE_HOME:-$HOME/.cache}/mise`，_macOS 上为：`~/Library/Caches/mise`。_

存储 mise 的内部缓存，例如插件的所有可用版本列表。不要跨机器共享此目录。在 mise 没有正在安装内容时，可以随时删除此目录。使用 `mise cache clear` 来清除。
详见[缓存行为](/cache-behavior)。

## `~/.local/state/mise`

- 覆盖方式：`$MISE_STATE_DIR`
- 默认值：`${XDG_STATE_HOME:-$HOME/.local/state}/mise`

用于存储本机特定的状态信息，例如哪些配置文件是受信任的。不应跨机器共享。

## `~/.local/share/mise`

- 覆盖方式：`$MISE_DATA_DIR`
- 默认值：`${XDG_DATA_HOME:-$HOME/.local/share}/mise`

这是 mise 使用的主目录，插件和工具都安装在这里。它与 asdf 的 `~/.asdf` 几乎完全相同，甚至你可能可以通过创建符号链接来同时使用 asdf 和 mise（不过支持这种用法不是项目目标）。

此目录*可以*跨机器共享，但前提是它们运行相同的操作系统/架构。一般来说不建议这样做。

### `~/.local/share/mise/downloads`

这是插件可选缓存下载资源（如压缩包）的位置。使用 `always_keep_downloads` 设置可以防止 mise 删除此处的文件。

### `~/.local/share/mise/plugins`

运行 `mise plugins install` 时，mise 会将插件安装到此目录。如果你正在开发一个插件，建议手动创建符号链接：

```sh
ln -s ~/src/mise-my-tool ~/.local/share/mise/plugins/my-tool
```

### `~/.local/share/mise/installs`

运行 `mise install` 时工具被安装到此处。例如，`mise install node@20.0.0` 会安装到 `~/.local/share/mise/installs/node/20.0.0`。

此处还会为版本前缀（"20" 和 "20.15"）和匹配的别名（"lts"、"latest"）创建符号链接。例如：

```sh
$ tree ~/.local/share/mise/installs/node
20 -> ./20.15.0
20.15 -> ./20.15.0
lts -> ./20.15.0
latest -> ./20.15.0
```

你可以设置 `MISE_INSTALLS_DIR` 环境变量来覆盖此位置。

### `~/.local/share/mise/shims`

这是 mise 放置 shims 的位置。通常用于 IDE 集成，或在 `mise activate` 因某些原因无法使用时作为替代方案。
