# 任务参数

任务参数允许你向任务传递参数，使其更灵活和可复用。在 mise 中有三种定义任务参数的方式，但目前只推荐使用其中两种。

## 推荐方式

### 1. Usage 字段（首选） {#usage-field}

**usage 字段**是定义任务参数的推荐方式。它提供了简洁的声明式语法，适用于 TOML 任务和文件任务。

#### 快速示例

```mise-toml [mise.toml]
[tasks.deploy]
description = "Deploy application"
usage = '''
arg "<environment>" help="Target environment" {
  choices "dev" "staging" "prod"
}
flag "-v --verbose" help="Enable verbose output"
flag "--region <region>" help="AWS region" default="us-east-1" env="AWS_REGION"
'''

run = '''
echo "Deploying to ${usage_environment?} in ${usage_region?}"
[[ "${usage_verbose?}" == "true" ]] && set -x
./deploy.sh "${usage_environment?}" "${usage_region?}"
'''
```

usage 字段中定义的参数自动作为以 `usage_` 为前缀的环境变量提供：

```shell
# 带参数执行
$ mise run deploy staging --verbose --region us-west-2

# 在任务内部，这些变量可用：
# $usage_environment = "staging"
# $usage_verbose = "true"
# $usage_region = "us-west-2"
```

除了环境变量之外，**usage 值还可以在任务运行脚本的 Tera 模板中通过 `usage` 映射**使用：

```mise-toml [mise.toml]
[tasks.deploy]
description = "Deploy application"
usage = '''
arg "<environment>" help="Target environment"
flag "-v --verbose" help="Enable verbose output"
flag "--region <region>" help="AWS region" default="us-east-1"
'''
run = '''
echo "Deploying to {{ usage.environment }} in {{ usage.region }}"
{% if usage.verbose %}
  echo "Verbose mode enabled"
{% endif %}
'''
```

`usage` 映射使用**参数/标志名的 snake_case 形式作为键**（与 `usage_` 环境变量一致）。名称中的 `-` 会转换为 `_`，因此 `--dry-run` 标志变为 <span v-pre>`{{ usage.dry_run }}`</span> 和 `$usage_dry_run`。可变参数/标志以数组形式暴露，可与 Tera 的 `for` 循环和 `length` 等过滤器一起使用。`usage` 映射与本页后面描述的已废弃 Tera 模板函数（`arg()`、`option()`、`flag()`）是**独立的**——你不应在同一个任务中混用两种方式。

**帮助输出示例：**

```shellsession
$ mise run deploy --help
Deploy application

Usage: deploy <environment> [OPTIONS]

Arguments:
  <environment>  Target environment [possible values: dev, staging, prod]

Options:
  -v, --verbose          Enable verbose output
      --region <region>  AWS region [env: AWS_REGION] [default: us-east-1]
  -h, --help            Print help
```

## 完整 Usage 规格参考

### 位置参数（`arg`）

位置参数用 `arg` 定义，必须按顺序提供。

#### 基本语法

```kdl
arg "<name>" help="Description"               // 必需的位置参数
arg "[name]" help="Description"               // 可选的位置参数
arg "<file>"                                  // 作为文件名补全
arg "<dir>"                                   // 作为目录补全
```

#### 带默认值

```kdl
arg "<file>" default="config.toml"            // 未提供时的默认值
arg "[output]" default="out.txt"              // 带默认值的可选参数
```

#### 可变参数

```kdl
arg "[files]" var=#true                        // 0 个或多个文件
arg "<files>" var=#true                        // 1 个或多个文件（必需）
arg "<files>" var=#true var_min=2              // 至少 2 个文件
arg "<files>" var=#true var_max=5              // 最多 5 个文件
arg "<files>" var=#true var_min=1 var_max=3    // 1 到 3 个文件
```

:::: tip 在 Bash 中处理带空格的可变参数
可变参数作为 shell 转义字符串传递。要在 bash 中正确处理包含空格的参数数组，请将变量用圆括号包裹：

```bash
# 转换为 bash 数组：
eval "files=($usage_files)"

# 使用数组：
for f in "${files[@]}"; do
  echo "Processing: $f"
done

# 或传递给命令：
touch "${files[@]}"
```

::::

#### 环境变量支持

```kdl
arg "<token>" env="API_TOKEN"                 // 可通过 $API_TOKEN 设置
arg "<host>" env="API_HOST" default="localhost"
```

优先级顺序：CLI 参数 > 环境变量 > 默认值

#### 选项（枚举值）

```kdl
arg "<level>" {
  choices "debug" "info" "warn" "error"
}
arg "<shell>" {
  choices "bash" "zsh" "fish"
  help "Shell type"
}
```

#### 高级功能

```kdl
arg "<file>" long_help="Extended help text shown with --help"

// 从帮助输出中隐藏
arg "<file>" hide=#true
```

#### 双短横线行为

```kdl
// 必须使用: mycli -- file.txt
arg "<file>" double_dash="required"

// 两种都有效: mycli file.txt 或 mycli -- file.txt
arg "<file>" double_dash="optional"

// 第一个参数之后，行为如同使用了 --
arg "<files>" double_dash="automatic"
```

### 标志（`flag`）

标志可以定义为布尔类型或接受值。

#### 布尔标志

```kdl
flag "-f --force"
flag "-v --verbose" help="Enable verbose mode"
flag "--dry-run" help="Preview without executing"
```

#### 仅短标志或仅长标志

```kdl
flag "-f"                                     // 仅短标志
flag "--force"                                // 仅长标志
```

#### 带值的标志

```kdl
flag "-o --output <file>" help="Output file"
flag "--port <port>" help="Server port"
flag "--color <when>" {
  choices "auto" "always" "never"
}
```

#### 带默认值的标志

```kdl
flag "--force" default=#true
flag "--format <format>" help="Output format" default="json"
flag "--port <port>" help="Server port" default="8080"
flag "--color <when>" {
  choices "auto" "always" "never"
  default "auto"
}
```

#### 计数标志

```kdl
// 可重复: -vvv
// $usage_verbose = 使用次数（例如 3）
flag "-v --verbose" count=#true
```

#### 取反

```kdl
flag "--color" negate="--no-color" default=#true
// 默认: $usage_color = "true"
// 使用 --no-color: $usage_color = "false"
```

#### 全局标志

```kdl
// 在所有子命令中可用（如果使用 cmd 结构）
flag "-v --verbose" global=#true
```

#### 标志高级功能

```kdl
flag "--verbose" long_help="Extended help text"
flag "--debug" hide=#true                      // 从帮助中隐藏
```

### 补全（`complete`）

可以为任何参数或标志按名称定义自定义补全：

```kdl
arg "<plugin>"
complete "plugin" run="mise plugins ls"       // 使用命令输出补全
```

#### 带描述

```kdl
complete "plugin" run="mycli plugins list" descriptions=#true
```

输出格式（以 `:` 分隔值和描述）：

```
nodejs:JavaScript runtime
python:Python language
ruby:Ruby language
```

### 长帮助文本

对于详细帮助文本，使用多行格式：

```mise-toml
[tasks.complex]
usage = '''
arg "<input>" {
  help "Input file to process"
  long_help """
  The input file should be in JSON or YAML format.

  Supported schemas:
  - schema-v1: Legacy format
  - schema-v2: Current format (recommended)
  - schema-v3: Experimental format

  Example:
    mise run complex data.json
  """
}
flag "--format <fmt>" {
  help "Output format"
  long_help """
  Supported output formats:
  - json: JSON output (default)
  - yaml: YAML output
  - toml: TOML output
  """
  choices "json" "yaml" "toml"
  default "json"
}
'''
run = 'process-data "${usage_input?}" --format "${usage_format?}"'
```

### 隐藏参数

从帮助输出中隐藏参数（适用于已废弃或内部选项）：

```kdl
arg "<legacy_arg>" hide=#true
flag "--internal-debug" hide=#true
```

### 组合功能示例

```mise-toml [mise.toml]
[tasks.deploy]
description = "Deploy application to cloud"
usage = '''
// 位置参数
arg "<environment>" {
  help "Deployment environment"
  choices "dev" "staging" "prod"
}

arg "[services]" {
  help "Services to deploy (default: all)"
  var #true
  var_min 0
}

// 标志
flag "-v --verbose" {
  help "Enable verbose logging"
  count #true
  default 0
}

flag "--dry-run" help="Show what would be deployed without doing it"

flag "--region <region>" {
  help "Cloud region"
  env "AWS_REGION"
  default "us-east-1"
  choices "us-east-1" "us-west-2" "eu-west-1"
}

flag "--skip-tests" help="Skip running tests before deploy"

flag "--force" help="Force deployment even with warnings"

// 自定义补全
complete "services" run="mycli list-services"
'''

run = '''
#!/usr/bin/env bash
set -euo pipefail

# 处理详细程度
if [[ "${usage_verbose?}" -ge 2 ]]; then
  set -x
elif [[ "${usage_verbose?}" -ge 1 ]]; then
  export VERBOSE=1
fi

# 验证环境
ENVIRONMENT="${usage_environment?}"
REGION="${usage_region?}"
DRY_RUN="${usage_dry_run:-false}"
SKIP_TESTS="${usage_skip_tests:-false}"
FORCE="${usage_force:-false}"

echo "Deploying to $ENVIRONMENT in $REGION"

# 运行测试（除非跳过）
if [[ "$SKIP_TESTS" != "true" ]]; then
  echo "Running tests..."
  npm test
fi

# 部署服务
if [[ -n "${usage_services?}" ]]; then
  echo "Deploying services: ${usage_services?}"
  for service in ${usage_services?}; do
    deploy_service "$service" "$ENVIRONMENT" "$REGION" "$DRY_RUN"
  done
else
  echo "Deploying all services"
  deploy_all "$ENVIRONMENT" "$REGION" "$DRY_RUN"
fi
'''
```

### 2. 文件任务头部 {#file-task-headers}

对于文件任务，你可以使用特殊的 `#MISE` 或 `#USAGE` 注释语法直接在文件中定义参数：

```bash [.mise/tasks/deploy]
#!/usr/bin/env bash
#MISE description "Deploy application"
#USAGE arg "<environment>" help="Deployment environment" {
#USAGE   choices "dev" "staging" "prod"
#USAGE }
#USAGE flag "--dry-run" help="Preview changes without deploying"
#USAGE flag "--region <region>" help="AWS region" default="us-east-1" env="AWS_REGION"

ENVIRONMENT="${usage_environment?}"
REGION="${usage_region?}"
DRY_RUN="${usage_dry_run:-false}"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "DRY RUN: Would deploy to $ENVIRONMENT in $REGION"
else
  echo "Deploying to $ENVIRONMENT in $REGION..."
  ./scripts/deploy.sh "$ENVIRONMENT" "$REGION"
fi
```

:::: tip 语法选项
在文件任务中使用 `#MISE`（大写，推荐）或 `#USAGE` 来定义参数。`# [MISE]` 或 `# [USAGE]` 也被接受，作为格式化工具的替代方案。
::::

## Usage 变量的 Bash 变量展开 {#bash-variable-expansion}

在 bash 脚本中访问 usage 定义的变量时，使用参数展开语法帮助 [shellcheck](https://www.shellcheck.net/) 理解这些变量，并为布尔标志提供默认值。

### 常用模式

| 语法               | 行为                | 使用场景                                          | 示例                          |
| ----------------- | ------------------- | ------------------------------------------------ | ----------------------------- |
| `${var?}`         | 未设置时报错         | usage 规格中有默认值的必需参数或标志                  | `${usage_profile?}`           |
| `${var:?}`        | 未设置或为空时报错    | 需要确保非空值时                                    | `${usage_target:?}`           |
| `${var:-default}` | 未设置时使用默认值    | usage 规格中没有 `default=` 的布尔标志               | `${usage_clean:-false}`       |
| `${var:=default}` | 未设置时设置并使用默认 | 想要为后续使用设置变量时                              | `${usage_dir:=.}`             |
| `${var:+value}`   | 已设置时使用 value   | 条件标志传递                                        | `${usage_verbose:+--verbose}` |

### Usage 变量指南

#### 带默认值的参数和标志

使用 `${usage_var?}`，因为 usage 保证它们会被设置：

```bash
# --profile 在 usage 规格中有 default="debug"
cargo build --profile "${usage_profile?}"
```

#### 没有默认值的布尔标志

使用 `${usage_var:-false}` 提供默认值：

```bash
# --clean 标志在 usage 规格中没有默认值
if [ "${usage_clean:-false}" = "true" ]; then
  cargo clean
fi
```

#### 必需参数

使用 `${usage_var:?}` 确保非空值：

```bash
# <target> 是必需的位置参数
cargo build --target "${usage_target:?}"
```

#### 条件标志

使用 `${usage_var:+value}` 仅在设置时传递标志：

```bash
# 仅在提供标志时添加 --verbose
mycli deploy ${usage_verbose:+--verbose}
```

这些展开帮助 [shellcheck](https://www.shellcheck.net/) 理解你的脚本，防止关于可能未设置变量的警告，同时保持正确的错误处理。

## 已废弃方式

### Tera 模板函数 <Badge type="danger" text="deprecated" /> {#tera-templates}

:::: danger 已废弃 - 将在 2026.11.0 移除
用于定义任务参数的 Tera 模板方法已**废弃**，将在 **mise 2026.11.0** 中**移除**。

**移除原因：**

- **两遍解析问题**：模板函数在规格收集期间返回空字符串，当尝试将它们用作普通模板值时会导致意外行为
- **复杂的转义规则**：Shell 转义规则令人困惑且容易出错
- **行为不一致**：在 TOML 和文件任务之间工作方式不同
- **用户体验差**：将参数定义与脚本逻辑混合

**迁移要求：** 请在 2026.11.0 之前迁移到 [usage 字段](#usage-field)方式。

**退出设置：** 如果你想立即禁用两遍解析行为（在移除之前），可以设置：

```toml
# ~/.config/mise/config.toml
[settings]
task.disable_spec_from_run_scripts = true
```

或通过环境变量：`MISE_TASK_DISABLE_SPEC_FROM_RUN_SCRIPTS=1`

启用后，mise 将仅使用 `usage` 字段生成规格，忽略运行脚本中的 `arg()`、`option()` 或 `flag()` 函数。参阅[设置](/configuration/settings)了解更多详情。
::::

<details>
<summary>点击查看已废弃的 Tera 模板语法（不推荐）</summary>

之前，你可以使用 Tera 模板函数在运行脚本中内联定义参数：

```mise-toml [mise.toml]
# ❌ 已废弃 - 请勿使用
[tasks.test]
run = 'cargo test {{arg(name="file", default="all")}}'
```

```mise-toml [mise.toml]
# ❌ 已废弃 - 请勿使用
[tasks.build]
run = [
  'cargo build {{option(name="profile", default="dev")}}',
  './scripts/package.sh {{flag(name="verbose")}}'
]
```

**此方式的问题：**

1. **解析期间的空字符串**：在规格收集（第一遍）期间，模板函数返回空字符串，因此不能在模板中这样使用：

   ```toml
   # 这不会按预期工作！
   run = 'echo "File: {{arg(name="file")}}" > {{arg(name="file")}}.log'
   # 第一遍: 'echo "File: " > .log'（无效！）
   ```

2. **转义复杂性**：不同 shell 类型需要不同的转义：

   ```toml
   # 转义行为因 shell 而异
   run = 'cmd {{arg(name="file")}}' # 可能或可能不会被正确转义
   ```

3. **不生成帮助信息**：不会生成正确的 `--help` 输出

</details>

### 迁移指南

以下是从 Tera 模板迁移到 usage 字段的方法：

#### 示例 1：简单参数

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

<div>

**旧方式（已废弃）：**

```mise-toml
[tasks.test]
run = '''
cargo test {{arg(
  name="file",
  default="all",
  help="Test file"
)}}
'''
```

</div>

<div>

**新方式（推荐）：**

```mise-toml
[tasks.test]
usage = 'arg "<file>" help="Test file" default="all"'
run = 'cargo test ${usage_file?}'
```

</div>

</div>

#### 示例 2：多参数带标志

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

<div>

**旧方式（已废弃）：**

```mise-toml
[tasks.build]
run = [
  'cargo build {{arg(name="target", default="debug")}}',
  './package.sh {{flag(name="verbose")}}'
]
```

</div>

<div>

**新方式（推荐）：**

```mise-toml
[tasks.build]
usage = '''
arg "<target>" default="debug"
flag "-v --verbose"
'''
run = [
  'cargo build ${usage_target?}',
  './package.sh ${usage_verbose?}'
]
```

</div>

</div>

#### 示例 3：带选项的选择

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

<div>

**旧方式（已废弃）：**

```mise-toml
[tasks.deploy]
run = '''
deploy {{option(
  name="env",
  choices=["dev", "prod"]
)}} {{flag(name="force")}}
'''
```

</div>

<div>

**新方式（推荐）：**

```mise-toml
[tasks.deploy]
usage = '''
flag "--env <env>" {
  choices "dev" "prod"
}
flag "--force"
'''
run = 'deploy --env ${usage_env?} ${usage_force?}'
```

</div>

</div>

#### 示例 4：可变参数

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

<div>

**旧方式（已废弃）：**

```mise-toml
[tasks.lint]
run = 'eslint {{arg(name="files", var=true)}}'
```

</div>

<div>

**新方式（推荐）：**

```mise-toml
[tasks.lint]
usage = 'arg "<files>" var=#true'
run = 'eslint ${usage_files?}'
```

</div>

</div>

:::: tip 处理带空格的参数
如果你的可变参数可能包含空格，将变量转换为 bash 数组：

```mise-toml
[tasks.process]
usage = 'arg "<files>" var=#true'
run = '''
eval "files=($usage_files)"
for f in "${files[@]}"; do
  process "$f"
done
'''
```

::::

## 另请参阅

- [任务配置](/tasks/task-configuration) - 完整的任务配置参考
- [TOML 任务](/tasks/toml-tasks) - TOML 任务语法
- [文件任务](/tasks/file-tasks) - 文件任务语法
- [运行任务](/tasks/running-tasks) - 如何执行任务
- [Usage 规格文档](https://usage.jdx.dev/spec/) - 完整的 usage 规格参考
