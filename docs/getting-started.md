<!-- markdownlint-disable MD034 -->

# 快速开始

几分钟内即可上手使用 mise。

## 1. 安装 `mise` CLI {#installing-mise-cli}

其他安装方式（`macport`、`apt`、`yum`、`nix` 等）请参阅 [安装 mise](/installing-mise)。

:::tabs key:installing-mise
== Linux/macOS

```shell
curl https://mise.run | sh
```

默认情况下，mise 会安装到 `~/.local/bin`，但可以放在任何位置。
验证安装：

```shell
~/.local/bin/mise --version
# mise 2024.x.x
```

- `~/.local/bin` 不需要在 `PATH` 中。mise 在 [激活](#activate-mise) 后会自动将自身目录添加到 `PATH`。

== Brew

```shell
brew install mise
```

== Windows
::: code-group

```shell [winget]
winget install jdx.mise
```

```shell [scoop]
# https://github.com/ScoopInstaller/Main/pull/6374
scoop install mise
```

```shell [chocolatey]
choco install mise
```

== Debian/Ubuntu (apt)

```sh
sudo apt update -y && sudo apt install -y curl
sudo install -dm 755 /etc/apt/keyrings
curl -fSs https://mise.jdx.dev/gpg-key.pub | sudo tee /etc/apt/keyrings/mise-archive-keyring.asc 1> /dev/null
echo "deb [signed-by=/etc/apt/keyrings/mise-archive-keyring.asc] https://mise.jdx.dev/deb stable main" | sudo tee /etc/apt/sources.list.d/mise.list
sudo apt update -y
sudo apt install -y mise
```

== Fedora 41+, RHEL/CentOS Stream 9+ (dnf)

```sh
sudo dnf copr enable jdxcode/mise
sudo dnf install mise
```

详情请参阅 [copr 页面](https://copr.fedorainfracloud.org/coprs/jdxcode/mise/)。

== Snap (beta)

```sh
sudo snap install mise --classic --beta
```

详情请参阅 [snapcraft.io 页面](https://snapcraft.io/mise)。

:::

如果你想更改这些路径，`mise` 支持 [`MISE_DATA_DIR`](/configuration) 和 [`XDG_DATA_HOME`](/configuration) 环境变量。

## 2. mise `exec` 和 `run` {#mise-exec-run}

安装 `mise` 后即可立即开始使用。`mise` 可用于安装和运行[开发工具](/dev-tools/)、启动[任务](/tasks/)以及管理[环境变量](/environments/)。

以指定版本运行工具的最快方式是 [`mise x|exec`](/cli/exec.html)。例如，启动 Python 3 交互式终端（REPL）：

::: tip
如果 `mise` 尚未在 `PATH` 中，请使用 `~/.local/bin/mise` 代替。
:::

```sh
mise exec python@3 -- python
# 如果 Python 尚未安装，将自动下载并安装
# Python 3.13.2
# >>> ...
```

或运行 node 24：

```sh
mise exec node@24 -- node -v
# v24.x.x
```

要永久安装工具，使用 [`mise u|use`](/cli/use.html)：

```shell
mise use --global node@24 # 安装 node 24 并设为全局默认版本
mise exec -- node my-script.js
# 用 node 24 运行 my-script.js...
```

[`mise r|run`](/cli/run.html) 可以在完整的 mise 上下文（工具 + 环境变量）中运行[任务](/tasks/)或脚本。

::: tip
你可以在 shell 的 rc 文件中设置别名，例如 `alias x="mise x --"`，减少输入量。
:::

## 3. 激活 `mise` <Badge text="可选" /> {#activate-mise}

`mise exec` 非常适合一次性命令，但在交互式 shell 中，你可能更希望激活 mise，让工具和环境变量自动加载。

有两种方式：

- [`mise activate`](/cli/activate) — 每次显示命令提示符时更新 `PATH` 和环境变量。推荐在交互式 shell 中使用。
- [Shims](dev-tools/shims.md) — 通过符号链接拦截命令调用并加载正确的环境。更适合 CI/CD、IDE 和脚本。注意 [Shims 不支持 `mise activate` 的所有功能](/dev-tools/shims.html#shims-vs-path)。

你也可以都不用，直接调用 `mise exec` 或 `mise run`。
详情请参阅[此指南](dev-tools/shims.md)。

以下是根据你的 shell 激活 mise 的方法：

:::tabs key:installing-mise

== https://mise.run

::: code-group

```sh [bash]
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
```

```sh [zsh]
echo 'eval "$(~/.local/bin/mise activate zsh)"' >> ~/.zshrc
```

```sh [fish]
echo '~/.local/bin/mise activate fish | source' >> ~/.config/fish/config.fish
```

== Brew

::: code-group

```sh [bash]
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
```

```sh [zsh]
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
```

```sh [fish]
# 无需操作！使用 brew 安装时 fish 会自动激活 mise
# 如需禁用此行为，运行 `set -Ux MISE_FISH_AUTO_ACTIVATE 0`
```

== Windows

将以下内容添加到你的 PowerShell 配置文件（`$PROFILE`）中：

```powershell
(&mise activate pwsh) | Out-String | Invoke-Expression
```

如需打开你的 PowerShell 配置文件：

```powershell
# 如果配置文件不存在则创建
if (-not (Test-Path $profile)) { New-Item $profile -Force }
# 打开配置文件
Invoke-Item $profile
```

- 如果不使用 PowerShell，请将 `<homedir>\AppData\Local\mise\shims` 添加到 `PATH`。

== 其他包管理器

::: code-group

```sh [bash]
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
```

```sh [zsh]
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
```

```sh [fish]
echo 'mise activate fish | source' >> ~/.config/fish/config.fish
```

:::

修改 rc 文件后，请重启 shell 会话以使其生效。运行 [`mise dr|doctor`](/cli/doctor.html) 来验证一切是否配置正确。

激活 mise 后，工具可以直接在 `PATH` 中使用：

```sh
mise use --global node@24
node -v
# v24.x.x
```

运行 `mise use --global node@24` 后，mise 会更新全局配置：

```toml [~/.config/mise/config.toml]
[tools]
node = "24"
```

## 4. 通过工具源安装工具（npm、pipx、core、aqua、github） {#tool-backends}

```mermaid
flowchart LR
  subgraph Backends
    core
    aqua
    github
    npm
    pipx
  end

  core --> node["core:node"]
  core --> python["core:python"]
  aqua -->gh["aqua:cli/cli"]
  github -->ripgrep["github:BurntSushi/ripgrep"]
  github -->ruff["github:astral-sh/ruff"]
  npm --> prettier["npm:prettier"]
  npm --> claude_code["npm:@anthropic-ai/claude-code"]
  pipx -->black["pipx:black"]
  pipx -->pycowsay["pipx:pycowsay"]
  aqua -->terraform["aqua:hashicorp/terraform"]

  subgraph Tools
    node
    python
    gh
    ripgrep
    ruff
    prettier
    claude_code
    black
    pycowsay
    terraform
  end
```

工具源（Backend）是 mise 安装工具时所依赖的生态系统或包管理器。通过 `mise use`，你可以从不同的工具源安装各种工具。

通过 npm 安装 [claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code)：

```sh
# 一次性使用
mise exec npm:@anthropic-ai/claude-code -- claude --version

# 或全局安装
mise use --global npm:@anthropic-ai/claude-code
claude --version
```

通过 pipx 安装 [black](https://github.com/psf/black)：

```sh
# 一次性使用
mise exec pipx:black -- black --version

# 或全局安装
mise use --global pipx:black
black --version
```

直接从 GitHub releases 安装 [ripgrep](https://github.com/BurntSushi/ripgrep)：

```sh
# 一次性使用
mise exec github:BurntSushi/ripgrep -- rg --version

# 或全局安装
mise use --global github:BurntSushi/ripgrep
rg --version
```

更多工具源和详细信息请参阅[工具源](/dev-tools/backends/)。

## 5. 设置环境变量 {#environment-variables}

在 `mise.toml` 中定义环境变量——当 mise 激活或使用 `mise exec` 时会自动加载：

```toml [mise.toml]
[env]
NODE_ENV = "production"
```

```sh
mise exec -- node --eval 'console.log(process.env.NODE_ENV)'

# 或者如果 mise 已在 shell 中激活
echo "node env: $NODE_ENV"
# node env: production
```

## 6. 运行任务 {#run-a-task}

在 `mise.toml` 中定义任务，并使用 `mise run` 运行：

```toml [mise.toml]
[tasks]
hello = "echo hello from mise"
```

```sh
mise run hello
# hello from mise
```

:::tip
mise 任务会在运行前自动安装 `mise.toml` 中的所有工具。
:::

更多关于如何定义和使用任务的信息，请参阅[任务](/tasks/)。

## 7. 下一步 {#next-steps}

请查看[使用教程](/walkthrough)获取更多 mise 使用示例。

### 设置自动补全 {#autocompletion}

请参阅[自动补全](/installing-mise.html#autocompletion)了解如何为你的 shell 设置自动补全。

### GitHub API 速率限制 {#github-api-rate-limiting}

::: warning
mise 中的许多工具需要使用 GitHub API。未经身份验证的请求通常会受到速率限制——如果遇到 4xx 错误，请将 `MISE_GITHUB_TOKEN` 或 `GITHUB_TOKEN` 设置为[个人访问令牌](https://github.com/settings/tokens/new?description=MISE_GITHUB_TOKEN)（不需要任何权限范围）。
:::
