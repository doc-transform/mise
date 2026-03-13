# direnv <Badge type="warning" text="deprecated" />

[direnv](https://direnv.net) 和 mise 都基于目录管理环境变量。由于它们都会在各自的"钩子"命令运行前后分析当前环境变量，因此有时会相互冲突。

:::: warning
官方立场是不建议将 direnv 与 mise 一起使用。因不兼容引起的问题不会被视为 bug。如果 mise 有功能缺失而 direnv 能满足的，请提交 issue 以便我们弥补这些差距。虽然这是官方立场，但实际上 mise 和 direnv 在大多数情况下可以正常协同工作。只有在较高级的使用场景下才会出现问题。
::::

如果你遇到问题，很可能与 PATH 的顺序有关。这意味着只有在你同时使用 direnv 和 mise 管理同一个工具时才会出问题。例如，你可能在 `.envrc` 中使用了 `layout python`，同时在 `.tool-versions` 文件中也维护了 python。

更典型的 direnv 用法是设置一些任意的环境变量，或者向 PATH 添加不相关的二进制文件。在这些情况下，mise 不会与 direnv 冲突。

## 在 direnv 中使用 mise（在 `.envrc` 中使用 `use mise`）

:::: warning
`use mise` 已废弃且不再支持。如果 `mise activate` 不能满足你的需求，请提交 issue。
::::

如果你在使用 `mise activate` 时确实遇到问题，或者只是想以另一种方式使用 direnv，这是一种更简单的设置，不太容易出问题——但会牺牲一些功能。

如果你想在 mise 中使用 direnv 的 `layout python`，可能需要这样做。否则在某些情况下 mise 会覆盖 direnv 的 PATH。`use mise` 确保 direnv 始终拥有控制权。

要实现这一点，首先使用 `mise` 生成一个可以在 `.envrc` 文件中使用的 `use_mise` 函数：

```sh
mise direnv activate > ~/.config/direnv/lib/use_mise.sh
```

现在在你的 `.envrc` 文件中添加：

```sh
use mise
```

direnv 现在会调用 mise 来导出其环境变量。你需要确保在所有使用 mise 的项目中添加 `use_mise`（或使用 direnv 的 `source_up` 从子目录加载）。你也可以将 `use mise` 添加到 `~/.config/direnv/direnvrc`。

注意，使用这种方法时，direnv 通常不会知道需要刷新 `.tool-versions` 文件，除非它们与 `.envrc` 文件在同一级目录。因此你可能总是需要在 `.tool-versions` 旁边放一个 `.envrc` 文件。为了更方便管理，我建议_完全不使用_ `.tool-versions`，而是完全在 `.envrc` 中设置环境变量：

```sh
export MISE_NODE_VERSION=20.0.0
export MISE_PYTHON_VERSION=3.11
```

当然，如果你使用 `mise activate`，这些步骤都不需要，你可以像没有使用 direnv 一样正常使用 mise。

如果你仍然遇到问题，也可以尝试使用 [shims 方式](dev-tools/shims.md)。

### 你真的需要 direnv 吗？

虽然让 mise 兼容 direnv 一直是且将始终是本项目的重要目标，但我也希望 mise 能够在需要时替代 direnv。这也是为什么 mise 包含了管理环境变量和 Python [虚拟环境](lang/python.md#automatic-virtualenv-activation)的功能（通过 `mise.toml`）。
