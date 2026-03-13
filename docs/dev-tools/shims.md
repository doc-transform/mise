# Shims

`mise` 上下文（开发工具、环境变量）可以通过多种方式加载到 shell 中：

- `mise activate`（也称为["mise PATH 激活"](#path-activation)），`mise` 在每次显示命令提示符时更新 `PATH` 和其他环境变量。
- [`mise activate --shims`](#mise-activate-shims)，通过 shims 加载开发工具。
- 使用 [`mise x|exec`](/cli/exec) 或 [`mise r|run`](/cli/run) 执行临时命令或任务（参阅["既不用 shims 也不用 PATH"](#neither-shims-nor-path)）。

本页将帮助你理解这些方法之间的区别及使用方式。特别是帮助你决定在 shell 中应该使用 shims 还是 `mise activate`。

## `mise` 激活方式概览 {#overview}

### PATH 激活 {#path-activation}

mise 的"PATH"激活方式在每次显示命令提示符时更新环境变量。尤其是更新 `PATH` 环境变量，shell 通过它来查找可执行程序。

::: info
这就是在 shell rc 文件中添加 `echo 'eval "$(mise activate bash)"' >> ~/.bashrc` 时使用的方式（此处以 bash 为例）。
:::

例如，默认情况下你的 `PATH` 变量可能是这样的：

```sh
echo $PATH
/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

如果使用了 [`mise activate`](/cli/activate.html)，`mise` 会自动将所需工具添加到 `PATH`：

```sh
PATH="$HOME/.local/share/mise/installs/python/3.13.0/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
```

在这个例子中，Python 的 `bin` 目录被添加到 `PATH` 的开头，使其在当前 shell 会话中可用。

虽然 `mise` 的 `PATH` 设计在大多数情况下都运行良好，但在某些场景下 `shims` 更合适。比如在非交互式 shell 中（例如在 IDE 或脚本中使用 `mise` 时）。

### Shims {#mise-activate-shims}

::: warning
`mise activate --shims` 不支持 `mise activate` 的所有功能。<br>
详见 [shims 与 PATH 对比](/dev-tools/shims.html#shims-vs-path)。
:::

使用 shims 时，`mise` 会在一个加入 `PATH` 的目录中放置小型可执行文件（`shims`）。你可以把 `shims` 理解为指向 mise 二进制文件的符号链接，它们拦截命令调用并加载相应的上下文。

```sh
ls -l ~/.local/share/mise/shims/node
# [...] ~/.local/share/mise/shims/node -> ~/.local/bin/mise
```

默认情况下，shim 目录位于 `~/.local/share/mise/shims`。安装工具（如 `node`）时，`mise` 会在 `shims` 目录中为该工具提供的每个二进制文件创建条目（如 `~/.local/share/mise/shims/node`）。

```sh
mise use -g node@20
npm install -g prettier@3.1.0

~/.local/share/mise/shims/node -v
# v20.0.0
~/.local/share/mise/shims/prettier -v
# 3.1.0
```

为了避免直接调用 `~/.local/share/mise/shims/node`，你可以将 `shims` 目录添加到 `PATH`：

```sh
export PATH="$HOME/.local/share/mise/shims:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
```

这样所有开发工具就可以在当前 shell 会话和非交互式环境中使用了。

::: tip
[`mise activate --shims`](/cli/activate.html#shims) 是将 shims 目录添加到 PATH 的快捷方式。
:::

## 如何将 mise shims 添加到 PATH

推荐的方式是在 shell 初始化文件中调用 [`mise activate --shims`](/cli/activate.html#shims)。例如：

::: code-group

```sh [bash]
# 注意 bash 会读取 ~/.profile 或 ~/.bash_profile（如果后者存在的话）
# 因此，你可能需要检查系统上定义了哪个文件，只向已有的文件追加
echo 'eval "$(mise activate bash --shims)"' >> ~/.bash_profile # 配置非交互式会话
echo 'eval "$(mise activate bash)"' >> ~/.bashrc       # 配置交互式会话
```

```sh [zsh]
echo 'eval "$(mise activate zsh --shims)"' >> ~/.zprofile # 配置非交互式会话
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc    # 配置交互式会话
```

```sh [fish]
echo 'mise activate fish --shims | source' >> ~/.config/fish/config.fish
echo 'mise activate fish | source' >> ~/.config/fish/fish.config
```

:::

在这个例子中，我们在非交互式 shell 配置文件（如 `.bash_profile` 或 `.zprofile`）中使用 [`mise activate --shims`](/cli/activate.html#shims)，在交互式 shell 配置文件（如 `.bashrc` 或 `.zshrc`）中使用 `mise activate`。

::: info
[`mise activate`](/cli/activate.html) 会从 `PATH` 中移除 shims 目录，所以可以放心在 shell profile 文件中先调用 [`mise activate --shims`](/cli/activate.html#shims)，之后在交互式会话中再调用 `mise activate`。
:::

- 如果你愿意，也可以只使用 `shims`，但这有一些[限制](/dev-tools/shims.html#shims-vs-path)。
- [`mise activate --shims`](/cli/activate.html#shims) 的替代方案是使用 `export PATH="$HOME/.local/share/mise/shims:$PATH"`。当 `mise` 在那个时间点尚不可用时很有用。

### mise reshim

要强制 `mise` 更新 `shims` 目录的内容，可以手动运行 `mise reshim`。

注意 `mise` 在每次安装/更新/删除工具时都会自动执行 reshim，所以这些场景下不需要手动操作。使用大多数工具（如 `npm`）时也会默认执行。

`mise reshim` 只创建/删除 shims。有些用户把它当作"修复"按钮，但它只在 `~/.local/share/mise/shims` 中缺少应有内容时才有必要。

不要在 `mise` 的 shims 目录中手动添加可执行文件，`mise` 会在下次 reshim 时删除它们。

## Shims 与 PATH 对比 {#shims-vs-path}

使用 shims **替代** [PATH 激活](#path-activation)时，以下功能会受到影响：

- mise 中定义的[环境变量](/environments/)仅对 mise 工具可用
- 大多数[钩子](/hooks.html)不会触发
- Unix 的 `which` 命令会指向 shim，遮蔽实际可执行文件

一般来说，在_交互式_场景中推荐使用 PATH（`mise activate`）而非 shims。

`activate` 的工作方式是每次显示命令提示符时，mise 会确定应该设置哪些 PATH 和环境变量并导出它们。这就是为什么它不适合脚本等非交互式场景——命令提示符不会显示，你必须手动调用 `mise hook-env` 来让 mise 更新环境变量。（但也有例外，见 [`cd` 钩子](#hook-on-cd)）

### 环境变量与 shims

shims 的一个缺点是环境变量只在调用 shim 时才会加载。这意味着如果你在 `mise.toml` 中设置了[环境变量](/environments/)，它只在 shim 被调用时才会生效。

以下示例只在 `mise activate` 下有效：

```sh
$ mise set NODE_ENV=production
$ echo $NODE_ENV
production
```

但以下方式在两种模式下都有效：

```sh
$ mise set NODE_ENV=production
$ node -p process.env.NODE_ENV
production
```

另外，[`mise x|exec`](/cli/exec.html) 和 [`mise r|run`](/cli/run.html) 即使不需要 mise 工具也可以获取环境变量：

```sh
$ mise set NODE_ENV=production
$ mise x -- bash -c "echo \$NODE_ENV"
production
$ mise r some_task_that_uses_NODE_ENV
production
```

::: tip
一般来说，[任务](/tasks/)是确保 mise 环境始终被加载的好方法。
:::

### 钩子与 shims

[钩子](/hooks.html) `cd`、`enter`、`exit` 和 `watch_files` 只在 `mise activate` 下触发。但 `preinstall` 和 `postinstall` 在 shims 模式下仍然有效，因为它们不需要 shell 集成。

### `which`

`which` 是很多用户觉得很有价值的命令。使用 shims 会"破坏" `which`，使它显示 shim 的位置。解决方法是使用 `mise which`，它会显示实际位置。有些用户更喜欢运行 `which node` 时能得到包含版本号的真实路径，例如：

```sh
$ which node
~/.mise/installs/node/20/bin/node
```

### 性能

说实话，使用 shims 和 `mise activate` 之间的性能差异你可能不会注意到。

- 由于 `mise activate` 每次显示命令提示符时都会运行，每次都会有几毫秒的开销。无论你是否在使用 mise 工具，每次运行任何命令都会付出这个代价。虽然有短路逻辑在没有变化时加速，但除非设置非常复杂，否则帮助不大。
- shims 的性能特征基本相同，但开销发生在调用 shim 时。这在某些情况下更好，某些情况下更差。

如果你在 bash 脚本中这样调用 shim：

```sh
for i in {1..500}; do
    node script.js
done
```

循环中每次调用都会付出 mise 的开销。但如果在 shim 内部调用子进程（比如 node 创建一个 node 子进程），_不会_付出新的开销。因为 shim 被调用时，mise 已经用所有工具的 PATH 设置好了环境，这些 PATH 条目在 shims 目录之前。

换句话说，哪种方式性能更好取决于你如何调用 mise。但实际上大多数用户不会注意到 `mise activate` 在终端上造成的几毫秒延迟。

唯一的区别是使用 `hook-env` 时切换目录后需要再次调用它，而 shims 则不需要。`mise activate` 会自动从 PATH 中移除 shims 目录，所以你不需要担心 PATH 中的 shims。

## 既不用 shims 也不用 PATH {#neither-shims-nor-path}

有很多方式可以加载 mise 环境而不需要上述两种方式，主要有：[`mise x|exec`](/cli/exec.html)、[`mise r|run`](/cli/run.html) 或 [`mise en`](/cli/en.html)。

这些都会在执行前加载所有工具和环境变量。这可能是理想的，因为你不需要修改 shell rc 文件，且环境总是被显式加载。有人可能觉得这是一种"干净"的工作方式。

明显的缺点是每次想用 `mise` 都需要在命令前加上 `mise exec|run`。不过你可以很方便地设置别名为 `mx|mr`。

- 如果你更偏好精确性而非"方便性"，这种方式更适合你。
- 或者如果你只是想在某个项目中使用 mise（因为团队在用），而不想用它管理系统上的其他东西。在这种情况下使用 shell 扩展就大材小用了。

::: info 这是 Jeff 使用的方式

> 部分原因是我经常需要确保使用的是 mise 的开发版本。如果你自己也在开发 mise，我建议以类似的方式工作，在开发期间禁用 `mise activate` 或 shims。
>
> 详见[我如何使用 mise](https://mise.jdx.dev/how-i-use-mise.html)。

:::

## `cd` 钩子 {#hook-on-cd}

在某些 shell（`bash`、`zsh`、`fish`、`xonsh`）中，`mise` 会挂载到 `cd` 命令，而在其他 shell 中只在显示命令提示符时运行。这依赖 `zsh` 的 `chpwd`、`bash` 的 `PROMPT_COMMAND`、`fish` 的 `fish_prompt` 和 `xonsh` 的 `on_chdir`。

好处是运行频率更低，但由于 mise 用 Rust 编写，执行开销可以忽略不计（几毫秒）。

::: details 在单行中运行多条命令

如果你这样在一行中运行一组命令：

```sh
cd ~
cd ~/src/proj1 && node -v && cd ~/src/proj2 && node -v
```

使用 `mise activate` 时，在没有 cd 钩子的 shell 中，这会使用 `~` 的工具，而不是 `~/src/proj1` 或 `~/src/proj2` 的工具，即使目录已经切换了。

因为在这些 shell 中，`mise` 在命令提示符显示前才运行，而在其他 shell 中它挂载在 `cd` 上。注意 shims 在上述内联示例中_始终_有效。

:::

## 在 rc 文件中使用 mise

rc 文件（如 `.zshrc`）比较特殊。它是脚本，但只在交互式会话中运行。如果你需要在 rc 文件中访问 mise 提供的工具，有两个选择：

::: code-group

```sh [hook-env]
eval "$(mise activate zsh)"
eval "$(mise hook-env -s zsh)"
node some_script.js
```

```sh [shims]
eval "$(mise activate zsh --shims)" # 应该放在最前面
eval "$(mise activate zsh)"
node some_script.js
```

:::
