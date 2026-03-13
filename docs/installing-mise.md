# 安装 Mise

如果你是 `mise` 新用户，请先阅读[快速开始](/getting-started)指南。

## 安装方式

本页列出了在各平台上安装 `mise` 的方式。

| 平台                  | 推荐方式       | 备选方式        |
| --------------------- | -------------- | --------------- |
| macOS                 | Homebrew       | mise.run        |
| Linux (Debian/Ubuntu) | apt            | mise.run        |
| Linux (Fedora/RHEL)   | dnf            | mise.run        |
| Linux (Arch)          | pacman         | mise.run        |
| Linux (Alpine)        | apk            | mise.run        |
| Windows               | Scoop          | winget          |
| 任意平台 (Rust 用户)  | cargo binstall | cargo install   |
| CI/Docker             | mise.run       | GitHub Releases |

:::: tip 哪些安装方式支持自动更新？
包管理器（apt、dnf、brew、pacman 等）会在你更新系统包时一并更新 mise。其他方式可以通过 `mise self-update` 来更新。
::::

### <https://mise.run>

`mise` 不一定需要在 `PATH` 中。如果你在 shell 的 rc 文件中运行了 activate 脚本，mise 会自动将自身添加到 `PATH`。

```sh
curl https://mise.run | sh
```

或带参数安装

```sh
curl https://mise.run | MISE_INSTALL_PATH=/usr/local/bin/mise sh
```

#### Shell 专属安装 + 激活

为了更便捷地完成安装，你可以使用 shell 专属的安装脚本，它会安装 mise 并自动在 shell 配置文件中添加激活命令：

:::: code-group

```sh [zsh]
curl https://mise.run/zsh | sh
# 安装 mise 并将激活命令添加到 ~/.zshrc
```

```sh [bash]
curl https://mise.run/bash | sh
# 安装 mise 并将激活命令添加到 ~/.bashrc
```

```sh [fish]
curl https://mise.run/fish | sh
# 安装 mise 并将激活命令添加到 ~/.config/fish/config.fish
```

::::

这些 shell 专属安装脚本会：

- 使用与主安装脚本相同的逻辑安装 mise
- 自动检测 shell 的配置文件
- 如果激活命令尚未添加，则自动添加
- 如果已配置则跳过（可安全重复运行）

可用选项：

- `MISE_DEBUG=1` – 启用调试日志
- `MISE_QUIET=1` – 禁用非错误输出
- `MISE_INSTALL_PATH=/some/path` – 自定义二进制文件路径（默认：`~/.local/bin/mise`）
- `MISE_VERSION=v2025.12.0` – 安装指定版本

如果你想验证安装脚本未被篡改：

```sh
gpg --keyserver hkps://keys.openpgp.org --recv-keys 24853EC9F655CE80B48E6C3A8B81C9D17413A06D
curl https://mise.jdx.dev/install.sh.sig | gpg --decrypt > install.sh
# 确认上面的签名来自 mise 发布密钥
sh ./install.sh
```

:::: tip
只要不通过 `MISE_VERSION` 指定版本，安装脚本会锁定到下载时的最新版本，校验和已内嵌在脚本文件中。因此将该脚本放入项目是确保所有人安装完全相同 mise 版本的好方法。
::::

支持的操作系统/架构：

- `macos-x64`
- `macos-arm64`
- `linux-x64`
- `linux-x64-musl`
- `linux-arm64`
- `linux-arm64-musl`
- `linux-armv6`
- `linux-armv6-musl`
- `linux-armv7`
- `linux-armv7-musl`

如果需要其他平台，请使用 `cargo install mise` 从源码编译（见下文）。

### apk

Alpine Linux：

```sh
apk add mise
```

_mise 位于 [community 仓库](https://gitlab.alpinelinux.org/alpine/aports/-/blob/master/community/mise/APKBUILD)。_

### apt

Ubuntu 26.04+ 可通过 PPA 安装：

```sh
sudo add-apt-repository -y ppa:jdxcode/mise
sudo apt update -y
sudo apt install -y mise
```

旧版 Ubuntu/Debian：

```sh
sudo apt update -y && sudo apt install -y curl
sudo install -dm 755 /etc/apt/keyrings
curl -fSs https://mise.jdx.dev/gpg-key.pub | sudo tee /etc/apt/keyrings/mise-archive-keyring.asc 1> /dev/null
echo "deb [signed-by=/etc/apt/keyrings/mise-archive-keyring.asc] https://mise.jdx.dev/deb stable main" | sudo tee /etc/apt/sources.list.d/mise.list
sudo apt update -y
sudo apt install -y mise
```

### pacman

Arch Linux：

```sh
sudo pacman -S mise
```

[Arch 软件包](https://archlinux.org/packages/extra/x86_64/mise/)

### Cargo

从源码编译：

```sh
cargo install mise
```

使用 [cargo-binstall](https://github.com/cargo-bins/cargo-binstall) 更快安装：

```sh
cargo install cargo-binstall
cargo binstall mise
```

从 main 分支最新提交构建：

```sh
cargo install mise --git https://github.com/jdx/mise --branch main
```

### dnf

#### Fedora 41+、RHEL 9+、CentOS Stream 9+

```sh
dnf copr enable jdxcode/mise
dnf install mise
```

[COPR 软件包页面](https://copr.fedorainfracloud.org/coprs/jdxcode/mise/)

### Snap（Linux，目前为 beta 版）

```sh
sudo snap install mise --classic --beta
```

[snapcraft.io 页面](https://snapcraft.io/mise)

### Docker

```sh
docker run jdxcode/mise x node@20 -- node -v
```

[Docker Hub](https://hub.docker.com/r/jdxcode/mise)

:::: details Dockerfile 示例

```dockerfile
FROM jdxcode/mise:latest AS mise

FROM debian:bookworm-slim
COPY --from=mise /usr/local/bin/mise /usr/local/bin/mise
RUN mise trust -a && mise install
```

::::

### Homebrew

```sh
brew install mise
```

[Homebrew formula](https://formulae.brew.sh/formula/mise)

### npm

mise 作为预编译二进制文件发布到 npm。这不是一个 Node.js 包——只是通过 npm 分发。适合在 JS 项目中通过 `package.json` 或 `npx` 来设置 mise。

```sh
npm install -g @jdxcode/mise
```

如果只想临时测试一下，可以用 npx：

```sh
npx @jdxcode/mise exec python@3.11 -- python some_script.py
```

[npm 包](https://www.npmjs.com/package/@jdxcode/mise)

### GitHub Releases

从 [GitHub](https://github.com/jdx/mise/releases) 下载最新版本。

```sh
curl -L https://github.com/jdx/mise/releases/download/v2025.12.0/mise-v2025.12.0-linux-x64 > /usr/local/bin/mise
chmod +x /usr/local/bin/mise
```

### MacPorts

```sh
sudo port install mise
```

[MacPorts port](https://ports.macports.org/port/mise/)

### nix

Nix 包管理器（需要 24.05 或更高版本）：

```sh
nix-env -iA mise
```

你也可以直接引用包：`mise-flake.packages.${system}.mise`，支持所有默认的 Nix 系统。

:::: tip NixOS 默认从源码编译
如需预编译二进制文件，请启用 [nix-ld](https://github.com/Mic92/nix-ld) 并禁用 [`all_compile`](/configuration/settings.html#all_compile)。
::::

### yum（RHEL 8、CentOS Stream 8、Amazon Linux 2）

```sh
yum install -y yum-utils
yum-config-manager --add-repo https://mise.jdx.dev/rpm/mise.repo
yum install -y mise
```

### zypper

```sh
sudo wget https://mise.jdx.dev/rpm/mise.repo -O /etc/zypp/repos.d/mise.repo
sudo zypper refresh
sudo zypper install mise
```

### Windows - Scoop

这是在 Windows 上安装 mise 的推荐方式。它会自动将 shims 目录添加到 PATH。

```sh
scoop install mise
```

[Scoop manifest](https://github.com/ScoopInstaller/Main/blob/master/bucket/mise.json)

### Windows - winget

```sh
winget install jdx.mise
```

[winget manifest](https://github.com/microsoft/winget-pkgs/tree/master/manifests/j/jdx/mise)

### Windows - Chocolatey

:::: info
Chocolatey 上的版本目前不是最新的。
::::

```sh
choco install mise
```

### Windows - 手动安装

从 [GitHub](https://github.com/jdx/mise/releases) 下载最新版本，将二进制文件添加到 PATH。

如果你的 shell 不支持 `mise activate`，你需要将 shims 目录（默认为 `%LOCALAPPDATA%\mise\shims`）手动添加到 PATH。

## Shell 配置

### Bash

```sh
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
```

### Zsh

```sh
echo 'eval "$(mise activate zsh)"' >> "${ZDOTDIR-$HOME}/.zshrc"
```

### Fish

```sh
echo 'mise activate fish | source' >> ~/.config/fish/config.fish
```

:::: tip
通过 Homebrew 等方式安装时，mise 可能已自动激活，无需手动配置。

详情请参阅 [`MISE_FISH_AUTO_ACTIVATE=1`](/configuration#mise-fish-auto-activate-1)。
::::

### PowerShell

:::: warning
请查阅 [about_Profiles](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles) 文档确认实际的 profile 文件路径。
如果父目录不存在，需要先手动创建。
::::

```powershell
echo '(&mise activate pwsh) | Out-String | Invoke-Expression' >> $HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
```

### Nushell

Nu [不支持 `eval`](https://www.nushell.sh/book/how_nushell_code_gets_run.html#eval-function)。
通过追加 `env.nu` 和 `config.nu` 来安装 mise：

```nushell
'
let mise_path = $nu.default-config-dir | path join mise.nu
^mise activate nu | save $mise_path --force
' | save $nu.env-path --append
"\nuse ($nu.default-config-dir | path join mise.nu)" | save $nu.config-path --append
```

如果你希望保持 dotfiles 整洁，可以保存到其他目录，然后更新 `$env.NU_LIB_DIRS`：

```nushell
"\n$env.NU_LIB_DIRS ++= ($mise_path | path dirname | to nuon)" | save $nu.env-path --append
```

### Xonsh

由于 `.xsh` 文件[不会被编译](https://github.com/xonsh/xonsh/issues/3953)，你可以使用纯 Python 导入来减少启动时间：
将以下代码添加到 `~/.config/xonsh/mise.py` 等配置文件中，然后在 `~/.config/xonsh/rc.xsh` 中 `import mise`：

```python
from pathlib import Path
from xonsh.built_ins import XSH

ctx = XSH.ctx
mise_init = subprocess.run([Path('~/bin/mise').expanduser(),'activate','xonsh'],capture_output=True,encoding="UTF-8").stdout
XSH.builtins.execx(mise_init,'exec',ctx,filename='mise')
```

或继续使用 `rc.xsh`/`.xonshrc`：

```sh
echo 'execx($(~/bin/mise activate xonsh))' >> ~/.config/xonsh/rc.xsh # 或 ~/.xonshrc
```

由于 `mise` 会同时修改 shell 环境变量 `$PATH` 和 OS 环境变量 `PATH`，请注意你的配置中这两者要保持一致（可在配置末尾添加 `os.environ['PATH'] = xonsh.built_ins.XSH.env.get_detyped('PATH')` 来确保同步）。

### Elvish

在 `rc.elv` 中添加：

```shell
var mise: = (ns [&])
eval (mise activate elvish | slurp) &ns=$mise: &on-end={|ns| set mise: = $ns }
mise:activate
```

可选：为 `mise` 创建别名以无缝集成 `mise {activate,deactivate,shell}`：

```shell
edit:add-var mise~ {|@args| mise:mise $@args }
```

### 其他 Shell？

添加新 shell 的支持并不复杂，因为项目中的 shell 代码非常少。
[查看这里](https://github.com/jdx/mise/tree/main/src/shell)了解其他 shell 的实现方式。
如果你的 shell 尚未支持，欢迎提交 PR，我们很乐意帮助你完成集成。

## 自动补全

:::: tip
部分安装方式会自动安装补全脚本。
::::

[`mise completion`](/cli/completion.html) 命令可以为你的 shell 生成自动补全脚本。
这需要先安装 `usage`。如果尚未安装，请运行：

```shell
mise use -g usage
```

然后根据你的 shell 运行相应命令安装补全脚本：

:::: code-group

```sh [bash]
# 需要先安装 bash-completion
mkdir -p ~/.local/share/bash-completion/completions/
mise completion bash --include-bash-completion-lib > ~/.local/share/bash-completion/completions/mise
```

```sh [zsh]
# 如果使用 oh-my-zsh，有一个 `mise` 插件。在 .zshrc 中更新：
# plugins=(... mise)

# 否则，查看 zsh 的补全搜索路径
echo $fpath | tr ' ' '\n'

# 如果是通过 `apt-get` 安装的 zsh，以下命令可以直接使用：
mkdir -p /usr/local/share/zsh/site-functions
mise completion zsh  > /usr/local/share/zsh/site-functions/_mise
```

```sh [fish]
mise completion fish > ~/.config/fish/completions/mise.fish
```

::::

然后重新加载 shell 配置文件或重启 shell。

## 故障排查

如果安装后遇到问题，请运行：

```sh
mise doctor
```

这会诊断 mise 配置中的常见问题。详情请参阅 [mise doctor](/cli/doctor)。

## 卸载

使用 `mise implode` 卸载 mise。这会删除 mise 二进制文件及其所有数据。
使用 `mise implode --help` 查看更多信息。

你也可以手动删除以下目录来彻底清理：

- `~/.local/share/mise`（也可能是 `MISE_DATA_DIR` 或 `XDG_DATA_HOME/mise`）
- `~/.local/state/mise`（也可能是 `MISE_STATE_DIR` 或 `XDG_STATE_HOME/mise`）
- `~/.config/mise`（也可能是 `MISE_CONFIG_DIR` 或 `XDG_CONFIG_HOME/mise`）
- Linux 上：`~/.cache/mise`（也可能是 `MISE_CACHE_DIR` 或 `XDG_CACHE_HOME/mise`）
- macOS 上：`~/Library/Caches/mise`（也可能是 `MISE_CACHE_DIR`）
