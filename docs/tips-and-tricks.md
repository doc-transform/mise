# 提示与技巧

关于使用 `mise` 的各种实用技巧。

## macOS Rosetta

如果你需要在 Apple Silicon 上以 x86_64 模式运行工具，mise 可以做到，但目前需要使用 x86_64 版本的 mise 本身。一个常见的使用场景是支持编译 node <=14。

你可以通过 [`MISE_ARCH`](https://mise.jdx.dev/configuration/settings.html#arch) 设置来实现，或者使用专用的 rosetta mise 可执行文件，如下所述：

首先，你需要一份为 x86_64 构建的 mise：

```sh
$ curl https://mise.run | MISE_INSTALL_PATH=~/.local/bin/mise-x64 MISE_INSTALL_ARCH=x64 sh
$ ~/.local/bin/mise-x64 --version
mise 2024.x.x
```

::: warning
如果 `~/.local/bin` 不在 PATH 中，你需要给所有命令加上 `~/.local/bin/mise-x64` 前缀。
:::

现在你可以使用 `mise-x64` 来安装工具：

```sh
mise-x64 use -g node@20
```

## Shebang

你可以在 shebang 中指定工具及其版本，无需事先设置 `mise.toml`/`.tool-versions` 配置：

```typescript
#!/usr/bin/env -S mise x node@20 -- node
// "env -S" 允许在 shebang 中使用多个参数
console.log(`Running node: ${process.version}`);
```

这在 mise 未激活的环境中（例如非交互式会话）也很有用。

## 引导脚本

你可以下载 <https://mise.run> 脚本用作项目的引导脚本：

```sh
curl https://mise.run > setup-mise.sh
chmod +x setup-mise.sh
./setup-mise.sh
```

::: tip
这个文件包含校验和，因此将其提交到项目中比动态调用 `curl https://mise.run` 更安全——当然这意味着它只会获取脚本创建时的 mise 版本。
:::

## 通过 zsh zinit 安装

[Zinit](https://github.com/zdharma-continuum/zinit) 是 ZSH 的插件管理器，使用以下代码片段可以获取 mise（以及用于 shell 补全的 usage）：

```sh
zinit as="command" lucid from="gh-r" for \
    id-as="usage" \
    atpull="%atclone" \
    jdx/usage
    #atload='eval "$(mise activate zsh)"' \

zinit as="command" lucid from="gh-r" for \
    id-as="mise" mv="mise* -> mise" \
    atclone="./mise* completion zsh > _mise" \
    atpull="%atclone" \
    atload='eval "$(mise activate zsh)"' \
    jdx/mise
```

## CI/CD

在 CI/CD 中使用 mise 是同步开发/构建工具版本的好方法。

### GitHub Actions

不使用 action 也可以很方便地使用 mise：

```yaml
jobs:
  build:
    steps:
      - run: |
          curl https://mise.run | sh
          echo "$HOME/.local/bin" >> $GITHUB_PATH
          echo "$HOME/.local/share/mise/shims" >> $GITHUB_PATH
```

你也可以使用自定义 action [`jdx/mise-action`](https://github.com/jdx/mise-action)：

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: jdx/mise-action@v3
      - run: node -v # 将使用 `mise.toml`/`.tool-versions` 中指定的 node 版本
```

## `mise set`

你可以使用 [`mise set`](/cli/set.html) 来添加环境变量，而不用手动编辑 `mise.toml`：

```sh
mise set NODE_ENV=production
```

## [`mise run`](/cli/run.html) 简写

只要任务名称不与 mise 内置命令冲突，可以省略 `run` 部分：

```sh
mise test
```

::: warning
不要在脚本中这样做，因为 mise 未来可能会新增与你的任务冲突的命令。
:::

## 软件验证

mise 为 aqua 工具提供**原生软件验证**，无需额外依赖。对于 aqua 工具，Cosign/Minisign 签名、SLSA 来源证明和 GitHub 认证都会使用 mise 内置实现自动验证。

对于其他验证需求（如 GPG），可以安装额外的工具：

```sh
brew install gpg
# 注意：aqua 工具不再需要 cosign 和 slsa-verifier
# mise 现在原生处理验证
```

配置 aqua 验证（默认全部启用）：

```sh
# 如需禁用特定验证方式
export MISE_AQUA_COSIGN=false
export MISE_AQUA_SLSA=false
export MISE_AQUA_GITHUB_ATTESTATIONS=false
export MISE_AQUA_MINISIGN=false
```

## [`mise up --bump`](/cli/upgrade.html)

使用 `mise up --bump` 将所有软件升级到最新版本并更新 `mise.toml` 文件。它会保持与之前相同的语义化版本范围。例如，如果你之前有 `node = "22"` 而 node 24 是最新版本，`mise up --bump node` 会将 `mise.toml` 更改为 `node = "24"`。

## cargo-binstall

cargo-binstall 有点像 ubi，但专门用于 Rust 工具。它为 cargo 发布的包获取预编译二进制文件。如果安装了 cargo-binstall，mise 会自动将其用于 `cargo:` 工具，所以如果你使用 `cargo:` 后端，建议添加它以大幅加快 `mise i` 的速度。

```sh
mise use -g cargo-binstall
```

## [`mise cache clear`](/cli/cache.html)

mise 出于性能考虑会进行缓存，但有时你需要使用最新数据（比如它没有注意到新发布的版本）。运行 `mise cache clear` 来清除缓存，基本上就是执行 `rm -rf ~/.cache/mise/*`。

## [`mise en`](/cli/en.html)

如果你不想始终使用 mise，`mise en` 是 `mise activate` 的一个很好的替代方案。它在当前目录设置 mise 环境，但之后不会持续运行和更新环境变量。

## 进入项目时自动安装

通过在 `mise.toml` 中添加以下内容，进入项目时自动安装工具：

```toml
[hooks]
enter = "mise i -q"
```

## [`mise tool [TOOL]`](/cli/tool.html)

使用 `mise tool [TOOL]` 获取工具使用的后端等信息：

```sh
❯ mise tool ripgrep
Backend:            aqua:BurntSushi/ripgrep
Installed Versions: 14.1.1
Active Version:     14.1.1
Requested Version:  latest
Config Source:      ~/src/mise/mise.toml
Tool Options:       [none]
```

## [`mise cfg`](/cli/config.html)

使用 `mise cfg` 列出 mise 在特定目录中读取的配置文件：

```sh
❯ mise cfg
Path                                    Tools
~/.config/mise/config.toml              (none)
~/.mise/config.toml                     (none)
~/src/mise.toml                         (none)
~/src/mise/.config/mise/conf.d/foo.toml (none)
~/src/mise/mise.toml                    actionlint, bun, cargo-binstall, cargo:…
~/src/mise/mise.local.toml              (none)
```

这有助于弄清配置文件的加载顺序，以确定哪个文件覆盖了设置。

## `mise.lock`

启用锁文件后，mise 会在 `mise.lock` 中记录完整版本和压缩包校验和（如果后端支持）。可以使用 [`mise up`](/cli/upgrade.html) 更新。你需要手动创建锁文件，然后 mise 会将工具信息添加进去：

```sh
touch mise.lock
mise i
```

锁文件使用整合格式，以 `[tools.name.assets]` 段落来组织每个工具下的资产信息。资产信息包括校验和、文件大小和可选的下载 URL。使用旧格式（`[tools.name.checksums]` 和 `[tools.name.sizes]` 分开的段落）的锁文件会自动迁移到新格式。

请注意，目前 mise 需要实际安装工具才能获取压缩包校验和（否则需要下载压缩包才能计算校验和，而通常下载完就会删除）。因此你可能需要先运行 `mise uninstall --all` 让它重新安装所有工具。即使不知道校验和，它也会存储完整版本号，所以至少版本会被锁定，只是没有对应的校验和。

## 锁文件 URL 追踪（避免速率限制）

使用锁文件（`mise.lock`）时，mise 会存储每个工具资产的精确下载 URL。这意味着在首次安装后，后续的 `mise install` 会使用锁文件中的 URL，而不是向 GitHub（或其他提供者）发起 API 调用。这有几个好处：

- **避免 GitHub API 速率限制**：无需为每次安装重复调用 API，这在 CI 或大型团队中很容易耗尽速率限制。
- **无需 GITHUB_TOKEN**：由于 URL 已知，简单安装不需要设置 `GITHUB_TOKEN`。
- **安装更快**：跳过 API 查询加速了重复安装。

这在 CI/CD 或有严格网络或认证要求的环境中特别有用。
