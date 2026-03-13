# 文件任务

除了通过配置定义任务外，还可以在以下目录中将任务定义为独立的脚本文件：

- `mise-tasks/:task_name`
- `.mise-tasks/:task_name`
- `mise/tasks/:task_name`
- `.mise/tasks/:task_name`
- `.config/mise/tasks/:task_name`

注意你可以通过 [task_config](/tasks/task-configuration.html#task-config-options) 部分来配置目录。

以下是一个构建 Rust CLI 的文件任务示例：

```bash [mise-tasks/build]
#!/usr/bin/env bash
#MISE description="Build the CLI"
cargo build
```

:::: tip 重要
确保文件是可执行的，否则 mise 将无法检测到它。

```shell
chmod +x mise-tasks/build
```

::::

将代码放在 bash 文件而不是 TOML 中，可以让编辑器更好地进行语法高亮和代码检查。

它们对于不使用 mise 的用户同样适用——当然他们需要另寻方法安装任务可能使用的开发工具。

## 任务配置

所有配置选项可在[任务配置](/tasks/task-configuration)中找到。
你可以通过在文件顶部添加 `#MISE` 注释来为文件任务提供额外配置。

```bash
#MISE description="Build the CLI"
#MISE alias="b"
#MISE sources=["Cargo.toml", "src/**/*.rs"]
#MISE outputs=["target/debug/mycli"]
#MISE env={RUST_BACKTRACE = "1"}
#MISE depends=["lint", "test"]
#MISE tools={rust="1.50.0"}
```

假设该文件位于 `mise-tasks/build`，可以用 `mise run build`（或其别名 `mise run b`）运行。

::::tip
注意格式化工具可能将 `#MISE` 改为 `# MISE`。mise 有意忽略后者以避免意外配置。作为替代方案，可以使用 `# [MISE]`。
::::

## Shebang

shebang 行是可选的，但如果存在，将用于确定运行脚本的 shell。你也可以用它来运行不同编程语言的脚本。

:::: code-group

```js [node]
#!/usr/bin/env node
//MISE description="Hello, World in Node.js"

console.log("Hello, World!");
```

```python
#!/usr/bin/env python
#MISE description="Hello, World in Python"

print('Hello, World!')
```

```ts [deno]
#!/usr/bin/env -S deno run --allow-env
//MISE description="Hello, World in Deno"

console.log(`PATH, ${Deno.env.get("PATH")}`);
```

```powershell [powershell]
#!/usr/bin/env pwsh
#MISE description="Hello, World in PowerShell"

$current_directory = Get-Location
Write-Host "Hello from PowerShell, current directory is $current_directory"
```

::::

## 编辑任务

可以运行 `mise tasks edit build`（使用 `$EDITOR`）来编辑脚本。如果不存在会自动创建。这对于快速编辑或创建新脚本很方便。

## 任务分组

`mise-tasks`、`.mise/tasks`、`mise/tasks` 或 `.config/mise/tasks` 中的文件任务可以分组到子目录中，加载时会自动为其名称添加前缀。

**示例**：如下目录结构：

```text
mise-tasks
├── build
└── test
    ├── _default
    ├── integration
    └── units
```

运行 `mise tasks` 将输出：

```shellsession
$ mise tasks
Name              Description Source
build                         ./mise-tasks/build
test                          ./mise-tasks/test/_default
test:integration              ./mise-tasks/test/integration
test:units                    ./mise-tasks/test/units
```

## 参数

:::: tip
关于任务参数的完整信息，请参阅专门的[任务参数](/tasks/task-arguments)页面。
::::

可以在文件中使用 [usage](https://usage.jdx.dev) 规格来提供参数解析、自动补全和文档功能，还可以导出为 markdown。这基本上将任务变成了完整的 CLI 工具。

::::tip
执行带有 usage 规格的 mise 任务不需要安装 `usage` CLI。但要让补全功能正常工作，需要安装 `usage` CLI 并在 PATH 中可用。
::::

### 带参数的文件任务示例

以下是一个使用 usage 部分特性构建 Rust CLI 的文件任务示例：

```bash [mise-tasks/build]
#!/usr/bin/env bash
set -e

#USAGE flag "-c --clean" help="Clean the build directory before building"
#USAGE flag "-p --profile <profile>" help="Build with the specified profile" default="debug" {
#USAGE   choices "debug" "release"
#USAGE }
#USAGE flag "-u --user <user>" help="The user to build for"
#USAGE complete "user" run="mycli users"
#USAGE arg "<target>" help="The target to build"

if [ "${usage_clean:-false}" = "true" ]; then
  cargo clean
fi

cargo build --profile "${usage_profile?}" --target "${usage_target?}"
```

:::: tip
关于 bash 参数展开模式如 `${var?}`、`${var:-default}` 和 `${var:+value}` 的详细信息，请参阅 [Usage 变量的 Bash 变量展开](/tasks/task-arguments#bash-variable-expansion)。
::::

如果你安装了 `usage`，任务将启用补全功能。在此示例中：

- `mise run -- build --profile <tab><tab>` 将显示 `debug` 和 `release` 作为选项。
- `--user` 标志也会显示由 `mycli users` 输出生成的补全。
- 注意：使用 `--` 来分隔 mise 标志和任务参数：`mise run -- build --profile release <target>`

（请注意，mise 的任务 CLI 和 markdown 帮助尚未实现，但已在计划中。）

::::tip
如果你没有收到任何自动补全建议，使用 `-v`（verbose）标志查看详情。例如，如果你使用 `mise run build -v` 且 `usage` 规格无效，你会看到错误信息如 `DEBUG failed to parse task file with usage`
::::

### Node.js 文件任务带参数的示例

以下是如何使用 [usage](https://usage.jdx.dev/cli/scripts#usage-scripts) 在 Node.js 脚本中解析参数：

```js [mise-tasks/greet]
#!/usr/bin/env -S node
//MISE description="Write a greeting to a file"
//USAGE flag "-f --force" help="Overwrite existing <file>"
//USAGE flag "-u --user <user>" help="User to run as"
//USAGE arg "<output_file>" help="The file to write" default="file.txt" {
//USAGE   choices "greeting.txt" "file.txt"
//USAGE }

const fs = require("fs");

const { usage_user, usage_force, usage_output_file } = process.env;

if (usage_force === "true") {
  fs.rmSync(usage_output_file, { force: true });
}

const user = usage_user ?? "world";
fs.appendFileSync(usage_output_file, `Hello, ${user}\n`);
console.log(`Greeting written to ${usage_output_file}`);
```

运行：

```shell
mise run greet greeting.txt --user Alice
# Greeting written to greeting.txt
```

如果传递了无效参数，将收到错误信息：

```shell
mise run greet invalid.txt --user Alice
# [greet] ERROR
#   0: Invalid choice for arg output_file: invalid.txt, expected one of greeting.txt, file.txt
```

如果安装了 `usage`，自动补全将显示 `output_file` 参数的可选值。

```shell
mise run greet <TAB>
# > greeting.txt
#   file.txt
```

## CWD

mise 在运行任务前会将当前工作目录设为 `mise.toml` 所在的目录。可以在任务头部设置 <span v-pre>`dir="{{cwd}}"`</span> 来覆盖：

```bash
#!/usr/bin/env bash
#MISE dir="{{cwd}}"
```

此外，原始工作目录可通过 `MISE_ORIGINAL_CWD` 环境变量获取：

```bash
#!/usr/bin/env bash
cd "$MISE_ORIGINAL_CWD"
```

## 直接运行任务

任务不需要在配置中注册，你可以直接通过传递脚本路径来运行：

```bash
mise run ./path/to/script.sh
```

注意路径必须以 `/` 或 `./` 开头才会被视为文件路径。（在 Windows 上可以是 `C:\` 或 `.\`）
