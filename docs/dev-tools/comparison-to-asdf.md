# 与 asdf 对比

mise 可以作为 asdf 的替代品。它支持同样的 `.tool-versions` 文件，并且可以通过 [asdf 工具源](/dev-tools/backends/asdf.html)使用 asdf 插件。

但 mise 不会复用已有的 asdf 目录（因此你需要重新安装工具或手动迁移），且 100% 兼容性并不是设计目标。不过，如果你是从 asdf-bash（0.15 及以下版本）迁移过来，mise 的[破坏性变更实际上比 asdf-go（0.16 及以上版本）还要少](https://asdf-vm.com/guide/upgrading-to-v0-16.html)。

从 asdf 迁移过来的普通用户普遍认为 mise 就是一个更快、更好用的 asdf。

:::tip
别忘了看看[环境变量](/environments/)和[任务](/tasks/)——这是 mise 的重要组成部分，asdf 没有对应功能。
:::

## 从 asdf 迁移到 mise

如果你要从 asdf 迁移到 mise，请参阅[如何从 asdf 迁移](/faq.html#how-do-i-migrate-from-asdf)。

## asdf Go 版（0.16+）

asdf 已用 Go 语言重写。由于撰写本文时（2025-01-01）这还比较新，我将 0.16+ 版本的信息（我称之为"asdf-go"，相对于"asdf-bash"）放在这个章节，文档其余部分适用于 asdf-bash（0.15 及以下版本）。

在性能方面，mise 仍然比 Go 版 asdf 快，但差距已经缩小很多。asdf 的速度可能已经够用，asdf-go 和 mise 之间的开销差异你可能注意不到——毕竟还有很多人在用 asdf-bash 并声称没感觉到它慢（别问我怎么做到的）：

![asdf 与 mise exec 性能对比图](./asdf-mise-exec-perf.jpg)

不过，我认为现在有了 asdf-go 后，性能已经不是切换的充分理由了。它是个原因，但只是次要的。mise 更好的安全性、更好的开发体验以及不依赖 shims 都比性能更重要。

他们花精力重写了 asdf——这也说明他们打算继续维护它（顺便说这很棒）。这意味着本文的部分内容可能会随着他们解决 asdf 的问题而过时。

## 供应链安全

asdf 插件不够安全。这在 [SECURITY.md](https://github.com/jdx/mise/blob/main/SECURITY.md) 中有详细说明，简单来说：asdf 插件包含 shell 代码，本质上可以在你的机器上做任何事情。这很危险。更糟糕的是，asdf 插件很少由工具厂商编写（你使用工具就已经需要信任厂商了），这意味着你使用的每个 asdf 插件都要额外信任一个随机开发者——信任他不会做恶意操作，也不会被黑客入侵后发布带有漏洞的插件更新。

mise 在部分工具上仍然使用 asdf 插件，但我们正在积极减少这个数量，同时将插件迁移到 [mise-plugins 组织](https://github.com/mise-plugins)。asdf 似乎也有类似的 asdf-community 组织模式，但实际上不同。asdf 在插件迁入 [asdf-community](https://github.com/asdf-community) 后仍给原作者提交权限，我认为这有违设立专门组织的初衷。我希望到 2025 年底，注册表中不再有任何我不拥有的 asdf 插件。

我还在积极采用额外的安全验证措施，如 node 安装时的 GPG 验证，以及 aqua 工具的 Cosign/SLSA/Minisign/GitHub attestation 原生验证。

## 用户体验

![CleanShot 2024-01-28 at 12 36 20@2x](https://github.com/jdx/mise-docs/assets/216188/47f381d7-1566-4b78-9260-3b85a21dd6ec)

一些命令与 asdf 相同，但也有些做了调整。asdf 能做的事 mise 都能做，但语法可能略有不同。mise 的命令更宽容，例如支持模糊匹配：`mise install node@20`。而在 asdf 中，虽然_可以_运行 `asdf install node latest:20`，但不能在 `.tool-versions` 文件或其他很多地方使用 `latest:20`。在 `mise` 中，模糊匹配到处都能用。

asdf 安装一个新运行时（如果插件未安装）需要好几步：

```sh
asdf plugin add node
asdf install node latest:20
asdf local node latest:20
```

在 `mise` 中只需一步，同时完成安装插件、安装运行时和设置版本：

```sh
mise use node@20
```

如果你已有 `.tool-versions` 或 `.mise.toml` 文件，可以一条命令安装所有插件和运行时：

```sh
mise install
```

我觉得 asdf 特别死板且难以学习。它还做了一些奇怪的决定，比如 `asdf list all` 用位置参数，但 `asdf latest --all` 用标志（为什么一个是标志一个是位置参数？）。`mise` 大量使用别名，你不需要记住是 `mise plugin add node` 还是 `mise plugin install node`。如果我能猜到你的意图，mise 就会尝试做出正确的响应。

话虽如此，asdf 有很多优点。它是目前最好的多运行时管理器，插件系统令人印象深刻。作者的大部分设计决策都非常好。我真正的不满只有两点：shims 和用 Bash 编写。

## 性能

asdf 做了一个我认为不太好的设计决策——在调用运行时和运行时本身之间使用 shims。例如，当你调用 `node` 时，实际上会调用 asdf 的 shim 文件 `~/.asdf/shims/node`，然后调用 `asdf exec`，再调用正确版本的 node。

这些 shims 性能很差，每次运行时调用增加约 120ms 开销。`mise activate` 不使用 shims，而是直接更新 `PATH`，调用二进制文件时零开销。这些 shims 是我开发 mise 的主要原因。注意本 README 顶部的演示 GIF 中，调用 `node -v` 时实际上并没有用到 `mise`，正是因为这个原因。性能与不使用 mise 直接运行 node 完全一致。

我认为 asdf 不太可能修复这些问题。asdf 的作者写了一篇关于[性能问题](https://stratus3d.com/blog/2022/08/11/asdf-performance/)的好文章。asdf 用 Bash 编写，确实很难做到高性能，但我认为真正的问题在于 shim 设计。不完全重写的话很难修复。

mise 每次目录变化时确实会调用内部命令 `mise hook-env`，但由于是 Rust 编写的，速度很快——在我的机器上大约 10ms，没有变化时 4ms，完整重载时 14ms。

总结：asdf 在调用运行时时增加约 120ms 开销，mise 在提示符加载时增加约 5ms 开销。

## Windows 支持

asdf 完全不支持 Windows。在 mise 中，使用非 asdf 工具源的工具可以支持 Windows。当然，这需要工具厂商提供 Windows 二进制文件，但如果提供了且工具源不是 asdf，该工具就能在 Windows 上工作。

## 安全性

asdf 插件不安全。它们通常由与工具厂商无关的个人编写。mise 在可能的情况下不使用 asdf 插件，而是使用 aqua 和 github 等不需要单独插件的工具源。

Aqua 工具在 mise 中内置了 Cosign/SLSA/Minisign/GitHub attestation 原生验证。详见 [SECURITY](https://github.com/jdx/mise/blob/main/SECURITY.md)。

## 命令兼容性

在几乎所有地方你都可以使用 asdf 的语法，但这些可能不会出现在帮助文档或 CLI 参考中。如果你从 asdf 迁移过来且习惯了那种工作方式，几乎总是可以在 mise 中使用相同的语法，例如：

```sh
mise install node 20.0.0
mise local node 20.0.0
```

更新（2025-01-01）：asdf-go（0.16+）实际上完全去掉了 `asdf global|local`，改用了 `asdf set`，而我们无法支持这个命令因为 mise 已经有一个叫 `mise set` 的命令。mise 与 asdf-go 0.16+ 的命令兼容性可能不太好。

不过不推荐使用 asdf 语法。你几乎总是想修改配置文件并安装工具，`mise use node@20` 可以少输一条命令。而且命令中的 "@" 更好，因为它允许一次安装多个工具：`mise use|install node@20 node@18`。另外，有些边界情况我们很难（或者说非常难）明确判断使用的是哪种语法，因此默认采用 mise 风格。虽然这类情况不多，但 asdf 兼容性是"尽力而为"的，目的是让 asdf 用户在过渡期能靠肌肉记忆使用。确保 asdf 语法在所有场景下都能工作不是设计目标。

## 额外工具源

mise 支持 asdf 插件之外的工具源。例如，你可以直接从 cargo 和 npm 安装 CLI 工具：

```sh
mise use -g cargo:ripgrep@14
mise use -g npm:prettier@3
```
