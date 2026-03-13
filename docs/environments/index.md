# 环境变量

> 类似 [direnv](https://github.com/direnv/direnv)，mise 可以为不同的项目目录管理_环境变量_。

使用 mise 为不同项目指定环境变量。

首先，在项目根目录创建一个 `mise.toml` 文件：

```toml [mise.toml]
[env]
NODE_ENV = 'production'
```

要清除一个环境变量，将其设为 `false`：

```toml [mise.toml]
[env]
NODE_ENV = false # 取消之前设置的 NODE_ENV
```

你也可以通过命令行来获取/设置环境变量：

```sh
mise set NODE_ENV=development
# mise set NODE_ENV
# development

mise set
# key       value        source
# NODE_ENV  development  mise.toml

cat mise.toml
# [env]
# NODE_ENV = 'development'

mise unset NODE_ENV
```

此外，[`mise env [--json] [--dotenv]`](/cli/env.html) 命令可以将环境变量导出为多种格式（包括 `PATH` 以及由工具或插件设置的环境变量）。

## 使用环境变量

环境变量在使用 [`mise x|exec`](/cli/exec.html) 或 [`mise r|run`](/cli/run.html)（即[任务](/tasks/)）时可用：

```shell
mise set MY_VAR=123
mise exec -- echo $MY_VAR
# 123
```

当然，你也可以将环境变量与[开发工具](/dev-tools/)配合使用：

```sh
mise use node@24
mise set MY_VAR=123
cat mise.toml
# [tools]
# node = '24'
# [env]
# MY_VAR = '123'
mise exec -- node --eval 'console.log(process.env.MY_VAR)'
# 123
```

如果 [mise 已激活](/getting-started.html#activate-mise)，当你 `cd` 进入一个目录时，它会自动在当前 shell 会话中设置环境变量。

```shell
cd /path/to/project
mise set NODE_ENV=production
cat mise.toml
# [env]
# NODE_ENV = 'production'

echo $NODE_ENV
# production
```

如果你使用的是 [`shims`](/dev-tools/shims.html)，环境变量在使用 shim 时同样可用：

```shell
mise set NODE_ENV=production
mise use node@24
# 使用绝对路径作为示例
~/.local/share/mise/shims/node --eval 'console.log(process.env.NODE_ENV)'
```

最后，你还可以使用 [`mise en`](/cli/en.html) 启动一个新的 shell 会话，其中已设置好环境变量。

```shell
mise set FOO=bar
mise en
> echo $FOO
# bar
```

## 在任务中使用环境变量

你也可以在任务中定义环境变量：

```toml [mise.toml]
[tasks.print]
run = "echo $MY_VAR"
env = { _.file = '/path/to/file.env', "MY_VAR" = "my variable" }
```

## 延迟求值

环境变量通常在工具之前解析——这样你可以用环境变量来配置工具安装。但有时你需要访问工具产生的环境变量。要实现这一点，将值改为带有 `tools = true` 的映射：

```toml
[env]
MY_VAR = { value = "tools path: {{env.PATH}}", tools = true }
_.path = { path = ["{{env.GEM_HOME}}/bin"], tools = true } # 指令也可以设置 tools = true
NODE_VERSION = { value = "{{ tools.node.version }}", tools = true }
```

## 脱敏处理

可以通过设置 `redact = true` 来对输出中的变量进行脱敏：

```toml
[env]
SECRET = { value = "my_secret", redact = true }
_.file = { path = ".env.json", redact = true }
```

你也可以使用 `redactions` 数组将多个环境变量标记为敏感信息：

```toml
redactions = ["SECRET_*", "*_TOKEN", "PASSWORD"]
[env]
SECRET_KEY = "sensitive_value"
API_TOKEN = "token_123"
PASSWORD = "my_password"
```

### 查看脱敏的环境变量

`mise env` 命令提供了处理脱敏变量的选项：

```bash
# 仅显示脱敏的环境变量
mise env --redacted

# 仅显示值（便于管道操作）
mise env --values

# 仅显示脱敏变量的值
mise env --redacted --values
```

:::: danger
由于 mise 可能输出敏感值，这些值可能出现在 CI 日志中，你需要配置 CI 来识别哪些值是敏感的。

例如，在使用 GitHub Actions 时，你应该使用 `::add-mask::` 来防止密钥出现在日志中：

```bash
# 在 GitHub Actions 工作流中
for value in $(mise env --redacted --values); do
  echo "::add-mask::$value"
done
```

注意：如果你使用 [mise-action](https://github.com/jdx/mise-action)，它会自动对标记了 `redact = true` 或匹配 `redactions` 数组中模式的值进行脱敏。
::::

## 必需变量

你可以通过设置 `required = true` 将环境变量标记为必需。这确保该变量在 mise 运行之前已定义，或在后续配置文件（如 `mise.local.toml`）中定义：

```toml
[env]
DATABASE_URL = { required = true }
API_KEY = { required = true }
```

你还可以提供帮助文本来指导用户如何设置变量：

```toml
[env]
DATABASE_URL = {
  required = "请将 DATABASE_URL 设置为你的 PostgreSQL 连接字符串（例如 postgres://user:pass@localhost/dbname）",
}
API_KEY = {
  required = "请从 https://example.com/api-keys 获取你的 API 密钥",
}
AWS_REGION = {
  required = "请设置你的 AWS 区域（例如 us-east-1、eu-west-1）",
}
```

当必需变量缺失时，mise 会在错误信息中显示帮助文本以协助用户。

### 必需变量的行为

当变量被标记为 `required = true` 时，mise 会验证它是否通过以下来源之一被定义：

1. **预先存在的环境** - 变量在运行 mise 之前已设置
2. **后续配置文件** - 变量在声明其为必需的配置文件之后处理的配置文件中定义

```toml
# 在 mise.toml 中
[env]
DATABASE_URL = { required = true }
```

```toml
# 在 mise.local.toml 中（后处理）
[env]
DATABASE_URL = "postgres://prod.example.com/db"  # 这满足了必需要求
```

### 验证行为

- **常规命令**（如 `mise env`）：当必需变量缺失时，会报出清晰的错误信息
- **Shell 激活**（`hook-env`）：对缺失的必需变量发出警告但继续执行，以避免中断 shell 设置

```bash
# 如果 DATABASE_URL 未预定义或不在后续配置中，这将失败
$ mise env
Error: Required environment variable 'DATABASE_URL' is not defined...

# 这将发出警告但继续执行（用于 shell 激活）
$ mise hook-env --shell bash
mise WARN Required environment variable 'DATABASE_URL' is not defined...
# Shell 激活继续成功
```

### 使用场景

必需变量适用于：

- **数据库连接** - 确保关键连接字符串已明确设置
- **API 密钥** - 要求明确配置敏感凭证
- **环境特定设置** - 强制每个环境进行明确配置
- **团队协作** - 记录团队成员必须配置哪些变量

```toml
[env]
# API 密钥（必须在环境变量或 mise.local.toml 中设置）
STRIPE_API_KEY = { required = true }
SENTRY_DSN = { required = true }

# 数据库连接（必须在环境变量或 mise.local.toml 中设置）
DATABASE_URL = { required = true }

# 功能开关（必须明确配置）
ENABLE_BETA_FEATURES = { required = true }
```

## `config_root`

`config_root` 是 mise 在解析配置文件中相对路径时使用的规范项目根目录。通常，当你在 mise 中使用相对路径时，指的就是这个目录。

- 当你的配置位于嵌套路径（如 `.config/mise/config.toml` 或 `.mise/config.toml`）时，`config_root` 指向包含这些文件的项目目录（例如 `/path/to/project`）。
- 当你的配置位于项目根目录（如 `mise.toml`）时，`config_root` 就是当前目录。
- 环境指令中的相对路径都相对于 `config_root` 解析，因此无论配置文件本身位于何处，行为都是一致的。

以下是一些配置文件及其 `config_root` 的示例：

| 配置文件                                     | `config_root`  |
| ------------------------------------------- | -------------- |
| `~/src/foo/.config/mise/conf.d/config.toml` | `~/src/foo`    |
| `~/src/foo/.config/mise/config.toml`        | `~/src/foo`    |
| `~/src/foo/.mise/config.toml`               | `~/src/foo`    |
| `~/src/foo/mise.toml`                       | `~/src/foo`    |

你可以在 [config_root.rs](https://github.com/jdx/mise/blob/main/src/config/config_file/config_root.rs) 中查看实现。

示例：

```toml
[env]
# 以下两种写法等价，都相对于项目根目录解析
_.path = ["tools/bin", "{{config_root}}/tools/bin"]

# 同样，相对路径的 source 文件也相对于项目根目录解析
_.source = "scripts/env.sh"          # 等同于 "{{config_root}}/scripts/env.sh"
```

## `env._` 指令

`env._.*` 用于定义设置环境变量的特殊行为（例如：从文件中读取环境变量）。由于嵌套环境变量没有意义，我们利用这一特性创建了一个名为 "\_" 的键，它是一个 TOML 表，用于配置这些指令。

### `env._.file`

在 `mise.toml` 中：`env._.file` 可用于指定要加载的 [dotenv](https://dotenv.org) 文件。

```toml
[env]
_.file = '.env'
```

:::: info
底层使用 [dotenvy](https://crates.io/crates/dotenvy) 实现。如果你在使用 `env._.file` 时遇到问题，可能需要到 dotenvy 项目提交 issue，因为 mise 对该库的工作方式无法做太多干预。
::::

`env._.file` 指令支持：

- 单个文件（字符串或对象）
- 多个文件（字符串和对象的数组）
- 使用相对路径或绝对路径
- 使用 `dotenv`、`json` 或 `yaml` 文件格式
- `redact` 和 `tools` 选项

```toml
[env]
_.file = '.env.yaml'
```

```toml
[env]
# 在工具定义环境变量之后从 dotenv 文件加载环境变量
_.file = { path = ".env", tools = true }
```

```toml
[env]
_.file = [
    # 从相对于此配置文件的 json 文件加载环境变量
    '.env.json',
    # 从绝对路径的 dotenv 文件加载环境变量
    '/User/bob/.env',
    # 从相对于此配置文件的 yaml 文件加载环境变量，并对值进行脱敏
    { path = ".secrets.yaml", redact = true }
]
```

你可以设置 [`MISE_ENV_FILE=.env`](/configuration#mise-env-file) 来在任何目录中自动加载 dotenv 文件。

参阅[密钥管理](/environments/secrets/)了解如何使用 `env._.file` 读取加密文件。

### `env._.path`

`PATH` 有特殊处理。使用 `env._.path` 可以向 `PATH` 添加额外的目录，使这些目录中的可执行文件在 shell 中无需输入完整路径即可使用：

```toml
[env]
_.path = './bin'
```

`env._.path` 指令支持：

- 单个路径（字符串或对象）
- 多个路径（字符串和对象的数组）
- 使用相对路径或绝对路径
- `tools` 选项

```toml
[env]
_.path = 'scripts'
```

```toml
[env]
# 在工具定义环境变量之后定义此路径目录
_.path = { path = ["{{env.GEM_HOME}}/bin"], tools = true }
```

```toml
[env]
_.path = [
    # 添加绝对路径
    "~/.local/share/bin",
    # 添加相对于项目根目录（config_root）的路径
    "{{config_root}}/node_modules/.bin",
    # 添加相对路径（等同于 "{{config_root}}/tools/bin"）
    "tools/bin",
]
```

相对路径（如 `tools/bin` 或 `./tools/bin`）相对于 <span v-pre>`{{config_root}}`</span> 解析。例如，配置文件位于 `/path/to/project/.config/mise/config.toml` 时，`tools/bin` 解析为 `/path/to/project/tools/bin`。

### `env._.source`

加载外部 bash 脚本并提取其中导出的环境变量：

```toml
[env]
_.source = "./script.sh"
```

:::: info
此脚本**必须**是一个 bash 脚本，执行方式如下：

```sh
source ./script.sh
```

shebang 行会被**忽略**。参阅 [#1448](https://github.com/jdx/mise/discussions/6734) 了解可能支持二进制文件或其他脚本语言的替代方案。
::::

`env._.source` 指令支持：

- 单个来源（字符串或对象）
- 多个来源（字符串和对象的数组）
- 使用相对路径或绝对路径
- `redact` 和 `tools` 选项

```toml
[env]
_.source = 'source.sh'
```

```toml
[env]
# 在工具定义环境变量之后加载此文件
_.source = { path = "my/env.sh", tools = true }
```

```toml
[env]
_.source = [
    # 加载相对于配置根目录的文件
    './scripts/base.sh',
    # 加载绝对路径的文件
    '/User/bob/env.sh',
    # 加载相对于配置根目录的文件，并对值进行脱敏
    { path = ".secrets.sh", redact = true }
]
```

## 插件提供的 `env._` 指令

插件可以提供自己的 `env._` 指令，用于动态设置环境变量和修改 PATH。这在以下场景特别有用：

- 集成外部密钥管理系统
- 基于动态条件设置环境变量
- 管理复杂的 PATH 配置
- 提供团队级别的环境标准化

### 基本用法

简单的插件激活：

```toml
[env]
_.my-plugin = {}
```

带配置选项的插件：

```toml
[env]
_.my-plugin = { option1 = "value1", option2 = "value2" }
```

### 工作原理

当你使用 `env._.<plugin-name>` 时，mise 会：

1. 从已安装的插件中加载该插件
2. 调用插件的 `MiseEnv` 钩子获取环境变量
3. 调用插件的 `MisePath` 钩子获取 PATH 条目（如果有定义）
4. 在运行 `mise env` 或使用 shell 集成时将这些应用到你的环境中

你提供的配置选项（`=` 后面的 TOML 表）会通过 `ctx.options` 传递给插件的钩子，允许按项目或按环境配置插件。

### 示例：密钥管理插件

```toml
[env]
# 从密钥库获取密钥
_.vault-secrets = {
  vault_url = "https://vault.example.com",
  secrets_path = "secret/myapp"
}
```

该插件可以从 HashiCorp Vault 获取密钥并将其暴露为环境变量。

### 示例：动态环境插件

```toml
[env]
# 基于 git 分支设置环境
_.git-env = { production_branch = "main" }
```

该插件可以检测当前 git 分支，在 `main` 分支时设置 `ENVIRONMENT=production`，否则设置 `ENVIRONMENT=development`。

### 创建环境插件

参阅插件文档中的[环境插件](/plugins#environment-plugins)，获取创建自己的环境插件的完整指南。

工作示例请参考 [mise-env-plugin-template](https://github.com/jdx/mise-env-plugin-template) 仓库。

## 多个 `env._` 指令

有时你需要使用多个 `env._` 指令，但以下 TOML 语法会失败，因为同一个表中有两个相同的键：

```toml
[env]
_.source = "./script_1.sh"
_.source = "./script_2.sh" # 无效 // [!code error]
```

对于这种情况，你可以将 `[env]` 改为数组表（array-of-tables），使用 `[[env]]` 代替：

```toml
[[env]]
_.source = "./script_1.sh"
[[env]]
_.source = "./script_2.sh"
```

这种方式功能完全相同，但你可以有多个表。

## 模板

环境变量的值可以使用模板，详见[模板](/templates)。

```toml
[env]
LD_LIBRARY_PATH = "/some/path:{{env.LD_LIBRARY_PATH}}"
```

## 在环境变量中引用其他环境变量

你可以在后续的环境变量中引用前面定义的环境变量：

```toml
[env]
MY_PROJ_LIB = "{{config_root}}/lib"
LD_LIBRARY_PATH = "/some/path:{{env.MY_PROJ_LIB}}"
```

当然，这样做时顺序很重要。

## Shell 风格的变量展开

作为 Tera 模板引用环境变量的更简便替代方案，你可以启用 [`env_shell_expand`](/configuration/settings.html#env_shell_expand) 设置来使用 shell 风格的 `$VAR` 语法：

```toml
[settings]
env_shell_expand = true

[env]
MY_PROJ_LIB = "{{config_root}}/lib"
LD_LIBRARY_PATH = "$MY_PROJ_LIB:$LD_LIBRARY_PATH"
```

支持的语法：

| 语法               | 说明                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| `$VAR`            | 展开为 `VAR` 的值                                                             |
| `${VAR}`          | 相同，当后面紧跟字母数字字符时很有用（例如 `${VAR}_suffix`）                       |
| `${VAR:-default}` | 当 `VAR` 未设置或为空时使用 `default`                                           |
| `${VAR:-}`        | 当 `VAR` 未设置时展开为空字符串（抑制未定义变量警告）                                |

展开在 Tera 模板渲染之后执行，因此两种语法可以混合使用。未定义且没有默认值的变量不会被展开，并会产生警告。

该设置是一个三态开关：

- **`true`** — 启用 shell 展开
- **`false`** — 禁用 shell 展开，不发出警告
- **未设置**（默认） — 禁用 shell 展开，但检测到 `$` 时发出警告

<!-- TODO(2026.7.0): update this to say shell expansion is enabled by default -->

:::: tip
Shell 展开将在 2026.7.0 版本中成为默认行为。现在设置 `env_shell_expand = true` 可以提前启用，或设置 `env_shell_expand = false` 保持当前行为。
::::
