# 任务配置

这是 `mise.toml` 或文件任务中所有可用任务配置选项的完整列表。

## 任务属性

所有示例使用 toml-task 格式而非文件格式，但除非另有说明，两者都适用。

### `run`

- **类型**：`string | (string | { task: string } | { tasks: string[] })[]`

要运行的命令。这是任务唯一必需的属性。

你现在可以将脚本与任务引用混合使用：

```mise-toml
[tasks.grouped]
run = [
  { task = "t1" },          # 运行 t1（包含其依赖）
  { tasks = ["t2", "t3"] }, # 并行运行 t2 和 t3（包含其依赖）
  "echo end",               # 然后运行一个脚本
]
```

简单形式仍然有效且等价：

```mise-toml
tasks.a = "echo hello"
tasks.b = ["echo hello"]
tasks.c.run = "echo hello"
[tasks.d]
run = "echo hello"
[tasks.e]
run = ["echo hello"]
```

### `run_windows`

- **类型**：`string | (string | { task: string } | { tasks: string[] })[]`

`run` 的 Windows 特定变体，支持相同的结构化语法：

```mise-toml
[tasks.build]
run = "cargo build"
run_windows = "cargo build --features windows"
```

### `description`

- **类型**：`string`

任务描述。用于帮助输出、补全、`mise run`（无参数时）和 `mise tasks` 等场景。

```mise-toml
[tasks.build]
description = "Build the CLI"
run = "cargo build"
```

### `alias`

- **类型**：`string | string[]`

任务的别名，可以用 `mise run <alias>` 代替完整的任务名称来运行。

```mise-toml
[tasks.build]
alias = "b" # 用 `mise run b` 运行
run = "cargo build"
```

### `depends`

- **类型**：`string | string[] | { task: string, args?: string[], env?: { [key]: string } }[]`

必须在此任务之前运行的任务。这是任务名称或别名的列表。可以向任务传递参数，例如：`depends = ["build --release"]`。如果多个任务有相同的依赖，该依赖只会运行一次。mise 将通过 `depends` 及相关属性尽可能并行运行任务（最多 [`--jobs`](/cli/run) 个）。

```mise-toml
[tasks.build]
run = "cargo build"
[tasks.test]
depends = ["build"]
run = "cargo test"
```

#### 向依赖传递环境变量

你可以使用两种语法向特定依赖传递环境变量：

**Shell 风格内联：**

```mise-toml
[tasks.test]
depends = ["NODE_ENV=test setup"]
run = "npm test"

[tasks.setup]
run = 'echo "Setting up for $NODE_ENV"'
```

**结构化对象格式：**

```mise-toml
[tasks.test]
depends = [
  { task = "setup", env = { NODE_ENV = "test", DEBUG = "true" } }
]
run = "npm test"
```

结构化格式还支持同时组合环境变量和参数：

```mise-toml
[tasks.deploy]
depends = [
  { task = "build", args = ["--release"],
    env = { RUSTFLAGS = "-C opt-level=3" } }
]
run = "./deploy.sh"
```

注意：这些环境变量仅传递给指定的依赖，不会传递给当前任务或其他依赖。

### `depends_post`

- **类型**：`string | string[] | { task: string, args?: string[], env?: { [key]: string } }[]`

类似 `depends`，但这些任务在此任务及其依赖完成_之后_运行。例如，你可能有一个 `postlint` 任务可以单独运行而不必运行 `lint`：

```mise-toml
[tasks.lint]
run = "eslint ."
depends_post = ["postlint"]
[tasks.postlint]
run = "echo 'linting complete'"
```

支持与 `depends` 相同的参数和环境变量语法。

### `wait_for`

- **类型**：`string | string[] | { task: string, args?: string[], env?: { [key]: string } }[]`

类似 `depends`，会等待这些任务完成后再运行，但不会将它们添加到运行列表中。本质上是可选依赖。

```mise-toml
[tasks.lint]
wait_for = ["render"] # 生成一些 js 文件，如果在运行，等待完成
run = "eslint ."
```

支持与 `depends` 相同的参数和环境变量语法。

`wait_for` 根据是否指定了参数或环境变量来匹配任务的方式不同：

- `wait_for = ["setup"]` — 按名称匹配，不管参数或环境变量覆盖。如果另一个任务运行 `depends = ["DEBUG=1 setup"]`，这仍然会匹配并等待它。
- `wait_for = ["setup arg1"]` 或 `wait_for = ["DEBUG=1 setup"]` — 仅匹配具有完全相同参数/环境变量配置运行的任务。

### `env`

- **类型**：`{ [key]: string | int | bool }`

此任务特有的环境变量。不会传递给 `depends` 任务。

```mise-toml
[tasks.test]
env.TEST_ENV_VAR = "ABC"
run = [
    "echo $TEST_ENV_VAR",
    "mise run some-other-task", # 这样运行任务_会_有 TEST_ENV_VAR 设置
]
```

### `tools`

- **类型**：`{ [key]: string }`

运行任务前安装和激活的工具。适用于需要安装特定工具或使用不同版本工具的任务。仅用于该任务，不用于依赖。

```mise-toml
[tasks.build]
tools.rust = "1.50.0"
run = "cargo build"
```

### `dir`

- **类型**：`string`
- **默认值**：<code v-pre>"{{ config_root }}"</code> - 包含 `mise.toml` 的目录，或如果是 `~/src/myproj/.config/mise.toml` 这样的路径，则为 `~/src/myproj`。

任务运行的目录。最常见的用法是让任务在用户当前目录中执行：

```mise-toml
[tasks.test]
dir = "{{cwd}}"
run = "cargo test"
```

### `hide`

- **类型**：`bool`
- **默认值**：`false`

从帮助、补全和 `mise tasks` 等输出中隐藏任务。适用于已废弃或不希望他人轻易看到的内部任务。

```mise-toml
[tasks.internal]
hide = true
run = "echo my internal task"
```

### `confirm`

- **类型**：`string`

运行任务前显示的消息。适用于破坏性操作或耗时较长的任务。用户将在任务运行前被提示确认。

```mise-toml
[tasks.release]
confirm = "Are you sure you want to cut a release?"
description = 'Cut a new release'
file = 'scripts/release.sh'
```

确认消息支持 Tera 模板，可以引用 usage 参数：

```mise-toml
[tasks.deploy]
usage = '''
arg "<environment>" help="Environment to deploy to"
flag "--force" help="Force deployment"
'''
confirm = "Deploy to {{ usage.environment }}?{% if usage.force %} (forced){% endif %}"
run = "deploy.sh ${usage_environment}"
```

### `raw`

- **类型**：`bool`
- **默认值**：`false`

将任务直接连接到 shell 的 stdin/stdout/stderr。适用于需要以 mise 正常任务处理不支持的方式接受输入或输出的任务。不推荐使用，因为在 mise 并行运行任务时会严重扰乱输出。使用此选项时确保没有其他任务同时运行。

### `sources`

- **类型**：`string | string[]`

此任务用作输入的文件或目录，如果同时定义了 `outputs`，且最旧输出文件的修改时间比最新源文件更新，mise 将跳过执行任务。适用于开销大且仅在输入变化时才需要运行的任务。

任务本身会自动作为源添加，因此编辑任务定义也会导致任务被运行。

这也用于 `mise watch` 以确定要监视哪些文件/目录。

可以使用相对于配置文件的相对路径和/或 glob 模式，例如：`src/**/*.rs`。确保不要在 glob 中添加大量文件——mise 必须扫描每一个以检查时间戳。

```mise-toml
[tasks.build]
run = "cargo build"
sources = ["Cargo.toml", "src/**/*.rs"]
outputs = ["target/debug/mycli"]
```

运行上述配置将仅在 `mise.toml`、`Cargo.toml` 或 `src` 目录中的任何 ".rs" 文件自上次构建以来发生变化时执行 `cargo build`。

[`task_source_files`](../templates.md#task-source-files) 函数可用于在模板上下文中遍历任务的 `sources`。

### `outputs`

- **类型**：`string | string[] | { auto = true }`
- **默认值**：`{ auto = true }`

`sources` 的对应项，这些是任务执行后将创建/修改的文件或目录。

`auto = true` 是手动指定输出文件的替代方案。此时 mise 将基于任务定义的哈希触碰一个内部跟踪文件（如果好奇，存储在 `~/.local/state/mise/task-outputs/<hash>`）。当你希望 `mise run` 在源文件变化时执行但不想手动 `touch` 文件以使 `sources` 生效时很有用。

```mise-toml
[tasks.build]
run = "cargo build"
sources = ["Cargo.toml", "src/**/*.rs"]
outputs = { auto = true } # 定义 sources 时这是默认值
```

### `shell`

- **类型**：`string`
- **默认值**：[`unix_default_inline_shell_args`](/configuration/settings.html#unix_default_inline_shell_args) 或 [`windows_default_inline_shell_args`](/configuration/settings.html#windows_default_inline_shell_args)
- **注意**：仅适用于 toml-tasks。

运行任务使用的 shell。如果你想用 `fish`、`zsh` 或 `pwsh` 等不同 shell 运行任务很有用。但通常建议使用 [shebang](./toml-tasks#shell-shebang)，因为支持 mise 的 IDE 可以为脚本提供语法高亮和代码检查。

```mise-toml
[tasks.hello]
run = '''
#!/usr/bin/env node
console.log('hello world')
'''
```

### `quiet`

- **类型**：`bool`
- **默认值**：`false`

抑制 mise 对任务的输出，如显示运行的命令 `[build] $ cargo build`。设置后，mise 不会显示任何输出，只显示脚本本身的输出。如果还想隐藏任务发出的输出，使用 [`silent`](#silent)。

### `silent`

- **类型**：`bool | "stdout" | "stderr"`
- **默认值**：`false`

抑制任务的所有输出。如果设为 `"stdout"` 或 `"stderr"`，则仅抑制该流。

### `usage`

- **类型**：`string`

:::: tip
关于任务参数和 usage 字段的完整信息，请参阅专门的[任务参数](/tasks/task-arguments)页面。
::::

可以在任务的 `usage` 字段中添加更高级的 usage 规格。仅适用于 toml-tasks。

```mise-toml
[tasks.test]
usage = '''
arg "<file>" help="The file to test" default="src/main.rs"
'''
run = 'cargo test ${usage_file?}'
```

#### 参数和标志的环境变量支持

usage 规格中的参数和标志都可以指定环境变量作为其值的替代来源。这允许在命令行未指定时通过环境变量提供任务参数。

优先级顺序：

1. CLI 参数/标志（最高优先级）
2. 环境变量（中等优先级）
3. 默认值（最低优先级）

**位置参数：**

```mise-toml
[tasks.deploy]
usage = '''
arg "<environment>" env="DEPLOY_ENV" help="Target environment" default="staging"
arg "<region>" env="AWS_REGION" help="AWS region" default="us-east-1"
'''

run = '''
echo "Deploying to ${usage_environment?} in ${usage_region?}"
'''
```

使用示例：

```bash
# 使用 CLI 参数（最高优先级）
mise run deploy production us-west-2

# 使用环境变量
export DEPLOY_ENV=production
export AWS_REGION=us-west-2
mise run deploy

# 使用默认值（最低优先级）
mise run deploy  # 部署到 staging 的 us-east-1

# CLI 覆盖环境变量
export DEPLOY_ENV=staging
mise run deploy production  # 部署到 production
```

**标志：**

```mise-toml
[tasks.build]
usage = '''
flag "-p --profile <profile>" env="BUILD_PROFILE" help="Build profile" default="dev"
flag "-v --verbose" env="VERBOSE" help="Verbose output"
'''

run = '''
echo "Building with profile: ${usage_profile?}"
echo "Verbose: ${usage_verbose:-false}"
'''
```

使用示例：

```bash
# 使用 CLI 标志
mise run build --profile release --verbose

# 使用环境变量
export BUILD_PROFILE=release
export VERBOSE=true
mise run build

# 混合使用 - 环境变量提供一个，CLI 提供另一个
export BUILD_PROFILE=release
mise run build --verbose
```

**文件任务**（在 `mise-tasks/` 或 `.mise/tasks/` 中定义的可执行文件任务）也支持 `env` 属性：

```bash
#!/usr/bin/env bash
#USAGE arg "<input>" env="INPUT_FILE" help="Input file to process"
#USAGE flag "-o --output <file>" env="OUTPUT_FILE" help="Output file" default="out.txt"

echo "Processing ${usage_input?} -> ${usage_output?}"
```

**必需参数：**

环境变量可以满足必需参数检查。如果参数标记为必需（使用尖括号 `<arg>`），通过 `env` 属性指定的环境变量提供其值可以满足该要求：

```mise-toml
[tasks.deploy]
usage = '''
arg "<api-key>" env="API_KEY" help="API key for deployment"
'''
run = 'deploy --api-key ${usage_api_key?}'
```

```bash
# 这将失败 - 未提供 API_KEY
mise run deploy

# 这将成功 - 通过环境提供 API_KEY
export API_KEY=secret123
mise run deploy

# 这也成功 - 通过 CLI 提供
mise run deploy secret123
```

## Vars

Vars 是可以在任务间共享的变量，类似环境变量但不会作为环境变量传递给脚本。它们定义在 `mise.toml` 文件的 `vars` 部分。

```mise-toml
[vars]
e2e_args = '--headless'

[tasks.test]
run = './scripts/test-e2e.sh {{vars.e2e_args}}'
```

与 mise 中的大多数配置一样，vars 可以跨多个文件定义。例如，你可以在全局 mise 配置 `~/.config/mise/config.toml` 中定义一些 vars，在 `~/src/work/myproject/mise.toml` 的任务中使用它们。你也可以在"后续"配置文件（如 `~/src/work/myproject/mise.local.toml`）中覆盖这些 vars，它们将在任何配置文件的任务中生效。

目前 vars 仅在 TOML 任务中支持。我想添加对文件任务的支持，但不想仅因此功能就将所有文件任务变成 tera 模板。

## `[task_config]` 选项

顶级 `mise.toml` 中 `[task_config]` 部分的可用选项。这些适用于该配置文件包含的所有任务或使用相同根目录的任务，例如 `~/src/myproject/mise.toml` 的 `[task_config]` 适用于 `~/src/myproject/mise-tasks/mytask` 等文件任务，但不适用于 `~/src/myproject/subproj/mise.toml` 中的任务。

### `task_config.dir`

更改任务运行的默认目录。

```toml
[task_config]
dir = "{{cwd}}"
```

### `task_config.includes`

添加包含 toml 任务的 toml 文件，或在查找任务时包含文件任务。

```toml
[task_config]
includes = [
    "tasks.toml", # 任务 toml 文件
    "mytasks"     # 包含文件任务的目录（除默认文件任务目录外）
]
```

如果使用包含的任务 toml 文件，注意其格式与 `mise.toml` 文件不同。它们只是任务列表，格式与 `mise.toml` 的 `[tasks]` 部分相同，但不带 `[task]` 前缀：

:::: code-group

```mise-toml [tasks.toml]
task1 = "echo task1"
task2 = "echo task2"
task3 = "echo task3"

[task4]
run = "echo task4"
```

::::

如果你想在包含的 toml 任务文件中使用自动补全/验证，可以使用以下 JSON schema：<https://mise.jdx.dev/schema/mise-task.json>

#### 远程 Git 包含 <Badge type="warning" text="experimental" />

你可以使用 `git::` URL 语法从 git 仓库包含任务目录：

:::: code-group

```mise-toml [ssh]
[task_config]
includes = [
    "git::ssh://git@github.com/myorg/shared-tasks.git//tasks?ref=v1.0.0"
]
```

```mise-toml [https]
[task_config]
includes = [
    "git::https://github.com/myorg/shared-tasks.git//tasks?ref=main"
]
```

::::

URL 格式：`git::<protocol>://<url>//<path>?<ref>`

必填字段：

- `protocol`：git 协议（ssh 或 https）。
- `url`：git 仓库 URL。
- `path`：仓库中目录的路径。

可选字段：

- `ref`：git 引用（分支、标签、提交）。默认为仓库的默认分支。

仓库将被克隆并缓存在 `MISE_CACHE_DIR/remote-git-tasks-cache`。包含目录中的任务将像本地文件任务一样加载。你可以使用 `MISE_TASK_REMOTE_NO_CACHE=true` 或 `--no-cache` 标志禁用缓存。

## Monorepo 支持 <Badge type="warning" text="experimental" />

mise 支持使用目标路径语法的 monorepo 风格任务组织。在根 `mise.toml` 中设置 `experimental_monorepo_root = true` 启用。

完整文档包括：

- 任务路径语法和通配符
- 工具层叠
- 性能调优
- 最佳实践和故障排除

请参阅专门的 [Monorepo 任务](/tasks/monorepo)文档。

## `redactions` <Badge type="warning" text="experimental" />

- **类型**：`string[]`

脱敏是一种从任务输出中隐藏敏感信息的方式。适用于 API 密钥、密码或其他不想在日志或其他输出中意外泄露的敏感信息。

要脱敏的环境变量列表。

```toml
redactions = ["API_KEY", "PASSWORD"]
```

运行上述任务将输出 `echo [redacted]` 而不是实际值。

也可以指定为 glob 模式，例如：`redactions.env = ["SECRETS_*"]`。

## `[vars]` 选项

Vars 是可以在任务间共享的变量，类似环境变量但不会作为环境变量传递给脚本。它们定义在 `mise.toml` 文件的 `vars` 部分。

```mise-toml
[vars]
e2e_args = '--headless'
[tasks.test]
run = './scripts/test-e2e.sh {{vars.e2e_args}}'
```

与 `[env]` 类似，vars 也可以从文件中读取：

```toml
[vars]
_.file = ".env"
```

vars 也支持[密钥管理](/environments/secrets/)。

## 任务配置设置

<script setup>
import Settings from '/components/settings.vue';
</script>

以下设置控制任务行为。可以在 `~/.config/mise/config.toml` 中全局设置，或在 `mise.toml` 中按项目设置：

<Settings :level="3" prefix="task" />
