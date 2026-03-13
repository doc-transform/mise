# TOML 任务

任务可以在 `mise.toml` 文件中以不同方式定义。简单任务可以写在 `[tasks]` 部分，而详细任务则各自拥有独立的部分。

## 简单任务示例

```mise-toml [mise.toml]
build = "cargo build"
test = "cargo test"
lint = "cargo clippy"
```

## 详细任务示例

```mise-toml [mise.toml]
[tasks.cleancache]
run = "rm -rf .cache"
hide = true # 从列表中隐藏此任务

[tasks.clean]
depends = ['cleancache']
run = "cargo clean" # 作为 shell 命令运行

[tasks.build]
description = 'Build the CLI'
run = "cargo build"
alias = 'b' # `mise run b`

[tasks.test]
description = 'Run automated tests'
# 多个命令按顺序运行
run = [
    'cargo test',
    './scripts/test-e2e.sh',
]
dir = "{{cwd}}" # 在用户当前目录运行，默认是项目根目录

[tasks.lint]
description = 'Lint with clippy'
env = { RUST_BACKTRACE = '1' } # 脚本的环境变量
# 你可以指定多行脚本而不是单独的命令
run = '''
#!/usr/bin/env bash
cargo clippy
'''

[tasks.ci] # 只定义依赖
description = 'Run CI tasks'
depends = ['build', 'lint', 'test']

[tasks.release]
confirm = 'Are you sure you want to cut a new release?'
description = 'Cut a new release'
file = 'scripts/release.sh' # 执行外部脚本
```

你可以使用[环境变量](/environments/)或 [`vars`](/tasks/task-configuration.html#vars-options) 来定义通用参数：

```mise-toml [mise.toml]
[env]
VERBOSE_ARGS = '--verbose'

# Vars 可以像环境变量一样在任务间共享，
# 但不会作为环境变量传递给脚本
[vars]
e2e_args = '--headless'

[tasks.test]
run = './scripts/test-e2e.sh {{vars.e2e_args}} $VERBOSE_ARGS'
```

## 添加任务

你可以直接编辑 `mise.toml` 文件，或使用 [`mise tasks add`](/cli/tasks/add)：

```shell
mise tasks add pre-commit --depends "test" --depends "render" -- echo pre-commit
```

将在 `mise.toml` 中添加：

```shell
[tasks.pre-commit]
depends = ["test", "render"]
run = "echo pre-commit"
```

## 常用选项

完整列表请参阅[任务配置](/tasks/task-configuration)。

### 运行命令

提供要运行的脚本。可以是单个命令或命令数组：

```mise-toml
[tasks.test]
run = 'cargo test'
```

命令按顺序运行。如果某个命令失败，任务将停止，剩余命令不会运行。

```mise-toml
[tasks.test]
run = [
    'cargo test',
    './scripts/test-e2e.sh',
]
```

你可以使用 `run_windows` 键指定在 Windows 上运行的替代命令：

```mise-toml
[tasks.test]
run = 'cargo test'
run_windows = 'cargo test --features windows'
```

### 指定工作目录

[`dir`](/tasks/task-configuration.html#dir) 属性决定任务执行的 `cwd`。你可以使用 <span v-pre>`dir = "{{cwd}}"`</span> 来使用运行任务时的目录：

```mise-toml
[tasks.test]
run = 'cargo test'
dir = "{{cwd}}"
```

此外，`MISE_ORIGINAL_CWD` 会被设置为原始工作目录并传递给任务。

### 添加描述和别名

你可以为任务添加描述和别名。

```mise-toml
[tasks.build]
description = 'Build the CLI'
run = "cargo build"
alias = 'b' # `mise run b`
```

- 此别名可用于运行任务
- 描述将在运行 [`mise tasks ls`](/cli/tasks/ls.html) 或不带参数的 [`mise run`](/cli/run.html) 时显示。

```shell
❯ mise run
Tasks
# 选择一个任务运行
# > build  Build the CLI
#   test   Run the tests
```

### 依赖

你可以为任务指定依赖。依赖在任务本身之前运行。如果依赖失败，任务将不会运行。

```mise-toml
[tasks.build]
run = 'cargo build'

[tasks.test]
depends = ['build']
```

还有其他方式指定依赖，参阅 [wait_for](/tasks/task-configuration.html#wait-for) 和 [depends_post](/tasks/task-configuration.html#depends-post)。

### 环境变量

你可以为任务指定环境变量：

```mise-toml
[tasks.lint]
description = 'Lint with clippy'
env = { RUST_BACKTRACE = '1' } # 脚本的环境变量
# 你可以指定多行脚本而不是单独的命令
run = '''
#!/usr/bin/env bash
cargo clippy
'''
```

### 源文件 / 输出

如果你想在特定文件未更改时跳过任务执行（即任务已是最新的），应指定 `sources` 和 `outputs`：

```mise-toml
[tasks.build]
description = 'Build the CLI'
run = "cargo build"
sources = ['Cargo.toml', 'src/**/*.rs'] # 如果这些文件没有变化则跳过运行
outputs = ['target/debug/mycli']
```

你可以单独使用 `sources` 配合 [`mise watch`](/cli/watch.html)，在源文件变化时运行任务。
你可以使用 [`task_source_files()`](../templates.md#task-source-files) 函数在[模板](../templates.md)中获取任务 `sources` 的解析路径。

### 确认提示

运行任务前显示的消息。用户将在任务运行前被提示确认。

```mise-toml
[tasks.release]
confirm = 'Are you sure you want to cut a new release?'
description = 'Cut a new release'
file = 'scripts/release.sh'
```

## 指定 shell 或解释器 {#shell-shebang}

如果 shell 是 `sh`、`bash` 或 `zsh`，任务会以 `set -e`（`set -o erropt`）执行。这意味着任何命令失败都会导致脚本退出。你可以在脚本中运行 `set +e` 来禁用此行为。

```mise-toml
[tasks.echo]
run = '''
set +e
cd /nonexistent
echo "This will not fail the task"
'''
```

你可以指定运行脚本的 `shell` 命令（默认是 [`sh -c`](/configuration/settings.html#unix_default_inline_shell_args) 或 [`cmd /c`](/configuration/settings.html#windows_default_inline_shell_args)）：

```mise-toml
[tasks.lint]
shell = 'bash -c'
run = "cargo clippy"
```

或使用 shebang：

```mise-toml
[tasks.lint]
run = '''
#!/usr/bin/env bash
cargo clippy
'''
```

通过使用 `shebang`（或 `shell`），你可以用不同语言运行任务（例如 Python、Node.js、Ruby 等）：

:::: code-group

```mise-toml [python]
[tools]
python = 'latest'

[tasks.python_task]
run = '''
#!/usr/bin/env python
for i in range(10):
    print(i)
'''
```

```mise-toml [python + uv]
[tools]
uv = 'latest'

[tasks.python_uv_task]
run = '''
#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["requests<3", "rich"]
# ///

import requests
from rich.pretty import pprint

resp = requests.get("https://peps.python.org/api/peps.json")
data = resp.json()
pprint([(k, v["title"]) for k, v in data.items()][:10])
'''
```

```mise-toml [node]
[tools]
node = 'lts'

[tasks.node_task]
shell = 'node -e'
run = [
  "console.log('First line')",
  "console.log('Second line')",
]
```

```mise-toml [bun]
[tools]
bun = 'latest'

[tasks.bun_shell]
description = "https://bun.sh/docs/runtime/shell"
run = '''
#!/usr/bin/env bun

import { $ } from "bun";
const response = await fetch("https://example.com");
await $`cat < ${response} | wc -c`; // 1256
'''
```

```mise-toml [deno]
[tools]
deno = 'latest'

[tasks.deno_task]
description = "A more complex task using Deno imports"
run = '''
#!/usr/bin/env -S deno run
import ProgressBar from "jsr:@deno-library/progress";
import { delay } from "jsr:@std/async";

if (!confirm('Start download?')) {
    Deno.exit(1);
}

const progress = new ProgressBar({ title:  "downloading:", total: 100 });
let completed = 0;
async function download() {
  while (completed <= 100) {
    await progress.render(completed++);
    await delay(10);
  }
}
await download();
'''
# ❯ mise run deno_task
# [download_task] $ import ProgressBar from "jsr:@deno-library/progress";
# Start download? [y/N] y
# downloading: ...
```

```mise-toml [ruby]
[tools]
ruby = 'latest'

[tasks.ruby_task]
run = '''
#!/usr/bin/env ruby
puts 'Hello, ruby!'
'''
```

::::

:::: details 什么是 shebang？`#!/usr/bin/env` 和 `#!/usr/bin/env -S` 有什么区别？

shebang 是脚本文件开头的字符序列 `#!`，告诉系统应使用哪个程序来解释/执行脚本。
[env 命令](https://manpages.ubuntu.com/manpages/jammy/man1/env.1.html)来自 GNU Coreutils。`mise` 不使用 `env` 但行为类似。

例如，`#!/usr/bin/env python` 会使用 `PATH` 中找到的 Python 解释器运行脚本。

`-S` 标志允许向解释器传递多个参数。它将行的其余部分视为要分割的单个参数字符串。

当你需要指定解释器标志或选项时非常有用。例如：`#!/usr/bin/env -S python -u` 会以无缓冲输出运行 Python。

::::

## 使用文件或远程脚本

你可以指定一个文件作为任务运行：

```mise-toml
[tasks.release]
description = 'Cut a new release'
file = 'scripts/release.sh' # 执行外部脚本
```

### 远程任务

任务文件可以通过多种协议远程获取：

#### HTTP

```mise-toml
[tasks.build]
file = "https://example.com/build.sh"
```

请注意，文件将被下载并执行。请确保你信任该来源。

#### Git <Badge type="warning" text="experimental" />

:::: code-group

```mise-toml [ssh]
[tasks.build]
file = "git::ssh://git@github.com/myorg/example.git//myfile?ref=v1.0.0"
```

```mise-toml [https]
[tasks.build]
file = "git::https://github.com/myorg/example.git//myfile?ref=v1.0.0"
```

::::

URL 格式必须遵循以下模式 `git::<protocol>://<url>//<path>?<ref>`

必填字段：

- `protocol`：git 仓库 URL。
- `url`：git 仓库 URL。
- `path`：仓库中文件的路径。

可选字段：

- `ref`：git 引用（分支、标签、提交）。

#### 缓存

每个任务文件都缓存在 `MISE_CACHE_DIR` 目录中。如果文件更新，除非清除缓存，否则不会重新下载。

::::tip
你可以运行 `mise cache clear` 来重置缓存。
::::

你可以使用 `MISE_TASK_REMOTE_NO_CACHE` 环境变量禁用远程任务的缓存。

## 参数

:::: tip
关于任务参数的完整信息，请参阅专门的[任务参数](/tasks/task-arguments)页面。
::::

默认情况下，参数传递给 `run` 数组中的最后一个脚本。所以如果任务定义为：

```mise-toml
[tasks.test]
run = ['cargo test', './scripts/test-e2e.sh']
```

那么运行 `mise run test foo bar` 会将 `foo bar` 传递给 `./scripts/test-e2e.sh`，但不会传递给 `cargo test`。

### 推荐方式：使用 Usage 字段

定义参数的推荐方式是使用 `usage` 字段：

```mise-toml
[tasks.test]
usage = '''
arg "<file>" help="Test file to run" default="all"
flag "--format <format>" help="Output format" default="text"
flag "-v --verbose" help="Enable verbose output"
'''
run = 'cargo test ${usage_file?} --format ${usage_format?}'
```

usage 字段中定义的参数作为以 `usage_` 为前缀的环境变量提供。

参阅[任务参数](/tasks/task-arguments#usage-field)页面获取完整文档。

### Tera 模板函数 <Badge type="danger" text="deprecated" />

:::: danger 已废弃 - 将在 2026.11.0 移除
在运行脚本中使用 Tera 模板函数（`arg()`、`option()`、`flag()`）已**废弃**，将在 **mise 2026.11.0** 中**移除**。>= 2026.5.0 版本会显示废弃警告。

**移除原因：**

- 模板函数在规格收集期间返回空字符串（两遍解析问题）
- 复杂且不可预测的 shell 转义规则
- 在 TOML/文件任务之间行为不一致

**请迁移到使用 `usage` 字段。** 参阅[迁移指南](/tasks/task-arguments#tera-templates)。
::::

<details>
<summary>点击查看已废弃的 Tera 模板语法（不推荐）</summary>

你可以使用 Tera 模板函数定义参数（已废弃）：

```mise-toml
[tasks.test]
run = [
    'cargo test {{arg(name="cargo_test_args", var=true)}}',
    './scripts/test-e2e.sh {{option(name="e2e_args")}}',
]
```

运行 `mise run test foo bar` 会将 `foo bar` 传递给 `cargo test`。
`mise run test --e2e-args baz` 会将 `baz` 传递给 `./scripts/test-e2e.sh`。

#### 位置参数

在脚本中用 <span v-pre>`{{arg()}}`</span> 定义。用于顺序很重要的位置参数。

示例：

```mise-toml
[tasks.test]
run = 'cargo test {{arg(name="file")}}'
# 执行: mise run test my-test-file
# 运行: cargo test my-test-file
```

- `i`：参数的索引。可用于指定参数顺序。默认为脚本中定义的顺序。
- `name`：参数名称。用于帮助/错误信息。
- `var`：如果为 `true`，可以传递多个参数。
- `default`：未提供参数时的默认值。

#### 选项

在脚本中用 <span v-pre>`{{option()}}`</span> 定义。用于顺序无关的命名参数。

示例：

```mise-toml
[tasks.test]
run = 'cargo test {{option(name="file")}}'
# 执行: mise run test --file my-test-file
# 运行: cargo test my-test-file
```

- `name`：参数名称。用于帮助/错误信息。
- `var`：如果为 `true`，可以传递多个值。
- `default`：未提供选项时的默认值。

#### 标志

标志类似选项但不接受值。在脚本中用 <span v-pre>
`{{flag()}}`</span> 定义。

示例：

```mise-toml
[tasks.echo]
run = 'echo {{flag(name="myflag")}}'
# 执行: mise run echo --myflag
# 运行: echo true
```

```mise-toml
[tasks.maybeClean]
run = '''
if [ '{{flag(name='clean')}}' = 'true' ]; then
  echo 'cleaning'
fi
'''
# 执行: mise run maybeClean --clean
# 运行: echo cleaning
```

- `name`：标志名称。用于帮助/错误信息。

传递标志时值为 `true`，否则为 `false`。

</details>
