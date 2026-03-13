# IDE 集成

代码编辑器和 IDE 的工作方式与交互式 shell 不同。

通常，它们要么继承当前 shell 的环境（如果你是从终端启动的，例如 `nvim .` 或 `code .`），要么有[自己的方式](https://github.com/microsoft/vscode-docs/blob/906acccd6180d8425577f8297ed29e221ad3daca/docs/supporting/faq.md?plain=1#L238)来设置环境。

IDE 启动后，如果你更新了 mise 配置文件，它不会自动重新加载 `mise` 提供的环境变量和 `PATH`。因此，我们不能依赖默认的 `mise activate` 方式来自动配置编辑器。

有几种方式可以让 `mise` 与编辑器配合工作：

- 一些编辑器或 IDE 插件直接支持 `mise`，允许你在 IDE 设置中选择工具/SDK 路径。这样可以访问工具二进制文件，但不会加载环境变量。
- 大多数编辑器（和语言插件）会在 `PATH` 中查找工具并在项目上下文中运行。因此，将 `mise` shims 添加到 `PATH` 可能就够了（见[下方](#adding-shims-to-path-default-shell)）。这样运行工具时会通过 mise 调用，并加载环境变量。
- 在其他情况下，你可能需要在 IDE 设置中手动指定 `mise` 提供的工具路径。可以使用 [`mise which <tool>`](./cli/which.md) 或 [`mise where`](./cli/where) 来获取路径。也可以指向 shim 的路径（如 `~/.local/share/mise/shims/node`），如果插件支持的话，这同样会在运行工具时加载环境变量。
- 最后，社区开发了一些专用插件来配合 `mise`。详见 [IDE 插件](#ide-plugins)部分。

## 在默认 shell 的 profile 中添加 shims 到 PATH {#adding-shims-to-path-default-shell}

IDE 使用 [shims](./dev-tools/shims) 比使用环境变量修改更稳定。最简单的方式是将 mise shim 目录添加到 `PATH`。

对于 IntelliJ 和 VSCode 等编辑器，你可以修改默认 shell 的登录（即 "profile"）脚本。查看默认 shell 的方式：

:::: code-group

```shell [macos]
dscl . -read /Users/$USER UserShell
```

```shell [linux]
getent passwd $USER | cut -d: -f7
```

::::

你可以用 `chsh -s /path/to/shell` 更换默认 shell，但可能需要先将其添加到 `/etc/shells`。确认 shell 后，修改对应文件：

:::: code-group

```zsh
# ~/.zprofile
eval "$(mise activate zsh --shims)"
```

```bash
# ~/.bash_profile 或 ~/.bash_login 或 ~/.profile
eval "$(mise activate bash --shims)"
```

```fish
# ~/.config/fish/config.fish
if status is-interactive
  mise activate fish | source
else
  mise activate fish --shims | source
end
```

::::

:::: warning
在 macOS 上不要使用 /bin/bash 或 /usr/bin/bash。bash 的版本很旧且复杂，mise 无法充分利用其特性。
除非你是 bash 专家并且清楚为什么 Apple 也不推荐使用 bash，否则请在 macOS 上使用 zsh。
::::

在 Linux 上，login profile 在登录时读取，因此修改后需要注销并重新登录才能生效。VSCode 的配置方式请参阅下方 #vscode 部分。

这里假设 `mise` 已经在 `PATH` 中。如果不在，需要使用绝对路径（如：`eval "$($HOME/.local/bin/mise activate zsh --shims)"`）。

以下示例展示了 VSCode 使用 mise 提供的 `node`：

:::: tabs
=== VSCode

![vscode 使用 shims](./shims-vscode.png)

=== IntelliJ
![intellij 使用 shims](./shims-intellij.png)
::::

如前所述，使用 `shims` 并不能覆盖 mise 的所有功能。例如，`[env]` 中的任意[环境变量](./environments/)只有在 shim 被执行时才会生效。要实现更深度的集成，需要 IDE 的原生支持和/或专用插件。

## IDE 插件

以下是社区开发的与 `mise` 配合使用的插件：

- Emacs: [mise.el](https://github.com/liuyinz/mise.el)
- IntelliJ: [intellij-mise](https://github.com/134130/intellij-mise)
- VSCode: [mise-vscode](https://github.com/hverlin/mise-vscode)

## Vim

```vim
" 将 mise shims 添加到 PATH 最前面
let $PATH = $HOME . '/.local/share/mise/shims:' . $PATH
```

## Neovim

```lua
-- 将 mise shims 添加到 PATH 最前面
vim.env.PATH = vim.env.HOME .. "/.local/share/mise/shims:" .. vim.env.PATH
```

如需更好的 Treesitter 和 LSP 集成，请查看 [Neovim cookbook](./mise-cookbook/neovim.md)。

## Emacs

### 传统 shims 方式

```lisp
;; 通过 Mise 安装的 CLI 工具
;; 参见: https://www.emacswiki.org/emacs/ExecPath
(setenv "PATH" (concat (getenv "PATH") ":/home/user/.local/share/mise/shims"))
(setq exec-path (append exec-path '("/home/user/.local/share/mise/shims")))
```

### 使用 [mise.el](https://github.com/eki3z/mise.el) 包

<https://github.com/eki3z/mise.el>

> 一个 GNU Emacs 库，使用 mise 工具来确定每个目录/项目的环境变量，然后在每个 buffer 的基础上设置这些环境变量。

```lisp
(require 'mise)
(add-hook 'after-init-hook #'global-mise-mode)
```

## JetBrains 系列编辑器（IntelliJ、RustRover、PyCharm、WebStorm、RubyMine、GoLand 等）

### IntelliJ 插件

<https://github.com/134130/intellij-mise>

这个插件可以自动配置 IDE 使用 mise 提供的工具，同时支持运行 mise 任务和在运行配置中加载环境变量。

### 直接选择 SDK

部分 JetBrains IDE（或语言插件）直接支持 `mise`，允许在 IDE 设置中选择 SDK 版本。
Java 的示例：

![SDK 设置](./intellij-sdk-selection.png)

### 通过 asdf 目录结构选择 SDK

部分插件尚未支持 `mise` 安装的 SDK，但可能支持 asdf。
这种情况下，可以将 mise 的工具目录软链接到 asdf 的位置（两者目录结构相同）：

```sh
ln -s ~/.local/share/mise ~/.asdf
```

之后在项目设置中就能看到这些工具了：

![项目设置](https://github.com/jdx/mise-docs/assets/216188/b34a0e3f-7af8-45c9-85b8-2c72bd1dc226)

对于 node（可能还有其他语言），在 "Languages & Frameworks" 中查看：

![Languages & Frameworks](https://github.com/jdx/mise-docs/assets/216188/9926be1c-ab88-451a-8ace-edf2dac564b5)

## VSCode

### macOS 上的 VSCode 自动化 Profile

与 Linux 不同，macOS 在登录时不会读取 login shell profile（`~/.profile` 或 `~/.zprofile`）。你可能需要在 VSCode 配置中添加以下设置来加载 shims：

```json
    "terminal.integrated.automationProfile.osx": {
        "path": "/usr/bin/zsh",
        "args": ["--login"]
    }
```

::::tip
你也可以使用 `["--login", "--interactive"]` 来同时加载 `~/.zshrc`。
::::

### VSCode 插件

[VSCode 插件](https://marketplace.visualstudio.com/items?itemName=hverlin.mise-vscode) 可以自动为你配置其他扩展，无需修改 shell profile 来添加 shims 到 `PATH`。

此外，它还提供以下功能：

- 自动配置其他扩展使用 `mise` 提供的工具
- 直接在 VSCode 中管理 `mise` 任务、工具和环境变量
- 在 VSCode 中加载 `mise.toml` 文件中的环境变量
- 支持 `mise.toml` 文件的自动补全和代码片段
- 与 VSCode 任务系统集成

<https://github.com/hverlin/mise-vscode/>（[文档](https://hverlin.github.io/mise-vscode/)）

### 在 launch 配置中使用 [`mise exec`](./cli/exec)

虽然修改默认 shell profile 可能是最简单的方案，但你也可以在 `launch.json` 中配置工具：

:::: details mise exec launch.json 示例

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${file}",
      "args": [],
      "osx": {
        "runtimeExecutable": "mise"
      },
      "linux": {
        "runtimeExecutable": "mise"
      },
      "runtimeArgs": ["exec", "--", "node"]
    }
  ]
}
```

::::

## Xcode

Xcode 项目可以在 Script Build Phase 和 Scheme 中运行系统命令。由于 Xcode 使用 `/usr/bin/sandbox-exec` 对脚本执行进行沙箱隔离，不要期望 mise 和自动激活的工具能开箱即用。首先，你需要将 `$(SRCROOT)/mise.toml` 添加到 **Input files** 列表中，这是让 Xcode 允许读取该文件所必需的。然后使用 `mise activate` 来激活所需的工具：

```bash
# -C 确保 mise 从项目根目录下的 mise 配置文件加载配置
eval "$($HOME/.local/bin/mise activate -C $SRCROOT bash --shims)"

swiftlint
```
