# 钩子 <Badge type="warning" text="experimental" />

你可以让 mise 在 `mise activate` 会话期间自动执行脚本。除了 `preinstall` 和 `postinstall` 钩子外，其他钩子必须在 shell 中安装了 `mise activate` 才能使用。配置写在 `mise.toml` 中。

## CD 钩子

每次切换目录时都会运行此钩子。

```toml
[hooks]
cd = "echo 'I changed directories'"
```

## Enter 钩子

进入项目时运行此钩子。在项目内切换目录不会再次触发此钩子。

```toml
[hooks]
enter = "echo 'I entered the project'"
```

## Leave 钩子

离开项目时运行此钩子。在项目内切换目录不会触发此钩子。

```toml
[hooks]
leave = "echo 'I left the project'"
```

## Preinstall/Postinstall 钩子

这两个钩子分别在工具安装前后运行。与其他钩子不同，它们不需要 `mise activate`。

```toml
[hooks]
preinstall = "echo 'I am about to install tools'"
postinstall = "echo 'I just installed tools'"
```

`postinstall` 钩子会接收一个 `MISE_INSTALLED_TOOLS` 环境变量，包含刚安装的工具的 JSON 数组：

```toml
[hooks]
postinstall = '''
echo "Installed: $MISE_INSTALLED_TOOLS"
# 输出示例: [{"name":"node","version":"20.10.0"},{"name":"python","version":"3.12.0"}]
'''
```

## 工具级别的 postinstall

单个工具可以使用 `postinstall` 选项定义自己的安装后脚本。这些脚本在每个工具安装完成后立即运行（在同一会话中其他工具安装之前）：

```toml
[tools]
node = { version = "20", postinstall = "npm install -g pnpm" }
python = { version = "3.12", postinstall = "pip install pipx" }
```

工具级别的 postinstall 脚本会接收以下环境变量：

- `MISE_TOOL_NAME`：工具的短名称（如 "node"、"python"）
- `MISE_TOOL_VERSION`：安装的版本（如 "20.10.0"、"3.12.0"）
- `MISE_TOOL_INSTALL_PATH`：工具的安装路径

## 文件监视钩子

在使用 `mise activate` 时，你可以让 mise 监视文件变化，并在文件发生更改时执行脚本。

```bash
[[watch_files]]
patterns = ["src/**/*.rs"]
run = "cargo fmt"
```

此钩子会设置以下环境变量：

- `MISE_WATCH_FILES_MODIFIED`：已修改文件的冒号分隔列表。冒号使用反斜杠转义。

## 钩子执行环境

钩子执行时会设置以下环境变量：

- `MISE_ORIGINAL_CWD`：用户所在的目录。
- `MISE_PROJECT_ROOT`：项目的根目录。
- `MISE_PREVIOUS_DIR`：目录切换前用户所在的目录（仅在发生目录切换时）。
- `MISE_INSTALLED_TOOLS`：已安装工具的 JSON 数组（仅用于 `postinstall` 钩子）。

## Shell 钩子

钩子可以在当前 shell 中执行，例如进入目录时加载 bash 补全：

```toml
[hooks.enter]
shell = "bash"
script = "source completions.sh"
```

:::: warning
虽然这应该很明显，但还是提醒一下：这不会像 `mise.toml` 中的 `[env]` 那样在你_离开_目录时进行清理。你实际上只是在进入目录时执行了 shell 代码，mise 完全无法追踪。目前没有解决这个问题的方案，这也可能是 direnv 从未实现类似功能的原因。

在大多数情况下这应该没问题，但值得留意。

::::

## 多钩子语法

你可以使用数组在同一文件中定义多个钩子：

```toml
[hooks]
enter = [
  "echo 'I entered the project'",
  "echo 'I am in the project'"
]

[[hooks.cd]]
script = "echo 'I changed directories'"
[[hooks.cd]]
script = "echo 'I also directories'"
```
