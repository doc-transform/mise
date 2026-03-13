# 模板

mise 中的模板提供了一种强大的方式来配置环境和项目设置的各个方面。

模板是包含变量、表达式和控制结构的字符串。渲染时，模板引擎（`tera`）会将变量替换为对应的值。

你可以在以下位置定义和使用模板：

- 大多数 `mise.toml` 配置值
  - `mise.toml` 文件本身不会被模板化，且必须是合法的 toml 格式
- `.tool-versions` 文件
- _（如果你希望在其他地方使用模板，欢迎提交工单！）_

## 示例

以下是一个使用模板的 `mise.toml` 文件示例：

```toml
[env]
PROJECT_NAME = "{{ cwd | basename }}"
TERRAFORM_VERSION = "1.0.0"

[tools]
# 引用本文件中定义的环境变量
terraform = "{{ env.TERRAFORM_VERSION }}"
# 引用外部环境变量
node = "{{ get_env(name='NODE_VERSION', default='20') }}"
```

更多示例请参见[实用手册](./mise-cookbook/index.md)。

## 模板渲染

mise 使用 [tera](https://keats.github.io/tera/docs/) 提供模板功能。模板中有三种分隔符：

- <span v-pre>`{{`</span> 和 <span v-pre>`}}`</span> 用于表达式
- <span v-pre>`{%`</span> 和 <span v-pre>`%}`</span> 用于语句
- <span v-pre>`{#`</span> 和 <span v-pre>`#}`</span> 用于注释

此外，使用 `raw` 块可以跳过 tera 分隔符的渲染：

<div v-pre>

```
{% raw %}
  Hello {{ name }}
{% endraw %}
```

</div>

这将输出 <span v-pre>`Hello {{name}}`</span>。

Tera 支持[字面量](https://keats.github.io/tera/docs/#literals)，包括：

- 布尔值：`true`（或 `True`）和 `false`（或 `False`）
- 整数
- 浮点数
- 字符串：由 `""`、`''` 或 <code>\`\`</code> 包裹的文本
- 数组：由 `[` 和 `]` 包裹的、逗号分隔的字面量和/或标识符列表（允许尾随逗号）

你可以使用 <span v-pre>`{{ name }}`</span> 来渲染变量。对于复杂属性，使用：

- 点号 `.`，如 <span v-pre>`{{ product.name }}`</span>
- 方括号 `[]`，如 <span v-pre>`{{ product["name"] }}`</span>

Tera 还支持强大的[表达式](https://keats.github.io/tera/docs/#expressions)：

- 数学表达式
  - `+`
  - `-`
  - `/`
  - `*`
  - `%`
- 比较运算
  - `==`
  - `!=`
  - `>=`
  - `<=`
  - `<`
  - `>`
- 逻辑运算
  - `and`
  - `or`
  - `not`
- 拼接 `~`，如 <code v-pre>{{ "hello " ~ 'world' ~ \`!\` }</code>
- 包含检查，如 <span v-pre>`{{ some_var in [1, 2, 3] }}`</span>

Tera 还支持 <span v-pre>`if`</span> 和 <span v-pre>`for`</span> 等控制结构。[了解更多](https://keats.github.io/tera/docs/#control-structures)。

### Tera 过滤器

你可以使用[过滤器](https://keats.github.io/tera/docs/#filters)修改变量。通过管道符（`|`）来使用过滤器，可以在括号中提供命名参数，也可以链式调用多个过滤器。例如 <span v-pre>`{{ "Doctor Who" | lower | replace(from="doctor", to="Dr.") }}`</span> 将输出 `Dr. who`。

### Tera 函数

[函数](https://keats.github.io/tera/docs/#functions)为模板提供额外功能。

### Tera 测试

你也可以使用[测试](https://keats.github.io/tera/docs/#tests)来检查变量。

```
{% if my_number is not odd %}
  Even
{% endif %}
```

## mise 模板特性

mise 在 tera 功能基础上提供了额外的变量、函数、过滤器和测试。

### 变量

mise 暴露了几个[变量](https://keats.github.io/tera/docs/#variables)，提供当前环境的关键信息：

- `env: HashMap<String, String>` – 以键值对形式访问当前环境变量。
- `cwd: PathBuf` – 指向当前工作目录。
- `config_root: PathBuf` – 定位包含 `mise.toml` 文件的目录。对于 `~/src/myproj/.config/mise.toml` 这样的路径，它会指向 `~/src/myproj`。
- `mise_bin: String` - 指向当前 mise 可执行文件的路径
- `mise_pid: String` - 指向当前 mise 进程的 pid
- `mise_env: Vec<String>` - 由 `MISE_ENV`、`-E` 或 `--env` 指定的配置环境。如果未设置配置环境则为未定义。
- `xdg_cache_home: PathBuf` - 指向 XDG 缓存主目录
- `xdg_config_home: PathBuf` - 指向 XDG 配置主目录
- `xdg_data_home: PathBuf` - 指向 XDG 数据主目录
- `xdg_state_home: PathBuf` - 指向 XDG 状态主目录
- `tools: HashMap<String, ToolInfo | ToolInfo[]>` – 将已安装的工具名称映射到其信息。在任务模板和设置了 `tools = true` 的 env 指令中可用。
  - 当安装了单个版本时：
    - `tools.<name>.version: String` – 解析后的版本（如 `"22.1.0"`）
    - `tools.<name>.path: String` – 安装路径
  - 当安装了多个版本时，变为数组：
    - `tools.<name>[0].version: String` – 第一个版本
    - `tools.<name>[0].path: String` – 第一个安装路径
    - `tools.<name>[1].version: String` – 第二个版本，以此类推。

在**任务运行脚本**中，当任务有 usage 规范时（参见[任务参数](/tasks/task-arguments#usage-field)），mise 还会暴露一个 `usage` 映射：

- `usage: HashMap<String, Value>` – 解析后的任务参数和标志，以名称为键。值**不会被 shell 转义或加引号**，可能是：
  - 布尔值（用于标志和布尔参数）
  - 字符串
  - 布尔值/字符串的数组（用于可变参数/标志）

键为 usage 规范中的参数/标志名称。如果名称包含 `-`，请使用方括号访问，如 <span v-pre>`{{ usage["dry-run"] }}`</span>。示例：

```mise-toml
[tasks.deploy]
usage = '''
arg "<environment>" help="Target environment"
flag "-v --verbose" help="Enable verbose output"
arg "[tags]" var=#true
'''
run = '''
echo "env={{ usage.environment }}"
echo "verbose={{ usage.verbose }}"
echo "tag count={{ usage.tags | length }}"
{% for tag in usage.tags %}
  echo "tag={{ tag }}"
{% endfor %}
'''
```

### 函数

#### Tera 内置函数

Tera 提供了许多[内置函数](https://keats.github.io/tera/docs/#built-in-functions)。`[]` 表示可选的函数参数。部分函数：

- `range(end, [start], [step_by])` - 返回根据给定参数创建的整数数组。
  - `end: usize`：在 `end` 之前停止，必填
  - `start: usize`：从哪里开始，默认为 `0`
  - `step_by: usize`：增量步长，默认为 `1`
- `now([timestamp], [utc])` - 返回本地日期时间字符串或时间戳整数。
  - `timestamp: bool`：是否返回时间戳而非日期时间
  - `utc: bool`：是否返回 UTC 日期时间而非本地时间
  - 提示：使用 date 过滤器格式化日期字符串。例如 <span v-pre>`{{ now() | date(format="%Y") }}`</span> 获取当前年份。
- `throw(message)` - 抛出带指定消息的错误。
- `get_random(end, [start])` - 返回指定范围内的随机整数。
  - `end: usize`：范围上限
  - `start: usize`：默认为 0
- `get_env(name, [default])`：按名称返回环境变量的值。建议优先使用 `env` 变量。
  - `name: String`：环境变量名称
  - `default: String`：找不到环境变量时的默认值。如果找不到且未设置 `default` 则抛出错误。

Tera 提供更多函数。请阅读 [tera 文档](https://keats.github.io/tera/docs/#functions)了解更多。

#### mise 附加函数

mise 在 tera 内置函数之外提供了大量实用函数。

##### 通用函数

这些函数在所有任务中可用，且无论在哪个任务定义中使用，行为始终一致。换句话说，它们的返回值在不同任务定义之间是一致的。

- `exec(command) -> String` – 运行 shell 命令并将输出作为字符串返回。
- `arch() -> String` – 获取系统架构，如 `x64` 或 `arm64`。
- `os() -> String` – 返回操作系统名称，如 linux、macos、windows。
- `os_family() -> String` – 返回操作系统家族，如 `unix`、`windows`。
- `num_cpus() -> usize` – 获取系统可用的 CPU 数量。
- `choice(n, alphabet)` - 从 `alphabet` 中随机有放回地采样生成长度为 `n` 的字符串。例如 `choice(64, HEX)` 会生成一个随机的 64 字符小写十六进制字符串。
- `read_file(path) -> String` – 读取给定路径的文件内容并作为字符串返回。

##### 任务特定函数

这些函数是任务特定的，在不同任务中的行为可能不同。换句话说，它们的返回值在任何给定*任务*的执行之间**_可能_**（但不保证）一致，在不同任务定义之间应当预期为不一致的。

例如，`task_source_files()` 根据所调用任务的 [`sources`](https://mise.jdx.dev/tasks/task-configuration.html#sources) 返回不同的文件路径集。

- <span id="task-source-files">`task_source_files() -> Vec<String>`</span> – 返回任务的 [`sources`](https://mise.jdx.dev/tasks/task-configuration.html#sources) 作为解析后的文件路径数组。此函数处理任务 sources 中定义的 glob 模式和 Tera 模板字符串，将它们展开为实际文件路径。如果某个模式没有匹配到任何文件，它将从结果中被省略。如果没有配置 sources 或没有匹配的文件，返回空数组。

#### 示例

```toml
# 使用 exec 获取命令输出
[alias.node.versions]
current = "{{ exec(command='node --version') }}"

# 使用 read_file 从文件中包含内容
[env]
VERSION = "{{ read_file(path='VERSION') | trim }}"

# 在任务脚本中访问解析后的源文件
[tasks.example]
sources = ["src/**/*.ts", "package.json"]
run = '''
{% for file in task_source_files() %}
  echo "Processing: {{ file }}"
{% endfor %}
'''
```

### Exec 选项

`exec` 函数支持以下选项：

- `command: String` – [必填] 要运行的命令。
- `cache_key: String` – 用于存储结果的缓存键。如果提供了缓存键，结果将被缓存并在后续调用中重用。
- `cache_duration: String` – 结果的缓存时长。时长单位为秒、分钟、小时、天或周。例如 `cache_duration="1d"` 会缓存结果 1 天。

### 过滤器

Tera 提供了许多[内置过滤器](https://keats.github.io/tera/docs/#built-in-filters)。`[]` 表示可选的过滤器参数。部分过滤器：

- `str | lower -> String` – 将字符串转为小写。
- `str | upper -> String` – 将字符串转为大写。
- `str | capitalize -> String` – 将字符串首字母大写，其余小写。
- `str | replace(from, to) -> String` – 将字符串中所有 `from` 替换为 `to`。例如 <span v-pre>`{{ name | replace(from="Robert", to="Bob")}}`</span>
- `str | title -> String` – 将句子中每个单词首字母大写。例如 <span v-pre>`{{ "foo bar" | title }}`</span> 变为 `Foo Bar`。
- `str | trim -> String` – 去除首尾空白字符。
- `str | trim_start -> String` – 去除开头空白字符。
- `str | trim_end -> String` – 去除末尾空白字符。
- `str | truncate -> String` – 截断字符串到指定长度。
- `str | first -> String` – 返回数组或字符串的第一个元素。
- `str | last -> String` – 返回数组或字符串的最后一个元素。
- `str | join(sep) -> String` – 用分隔符连接字符串数组。例如 <span v-pre>`{{ ["a", "b", "c"] | join(sep=", ") }}`</span> 生成 `a, b, c`。
- `str | length -> usize` – 返回字符串或数组的长度。
- `str | reverse -> String` – 反转字符串中字符或数组中元素的顺序。
- `str | urlencode -> String` – 将字符串编码为 URL 安全格式，将特殊字符转换为百分号编码值。
- `arr | map(attribute) -> Array` – 从数组中每个对象提取指定属性。
- `arr | concat(with) -> Array` – 向数组追加值。
- `num | abs -> Number` – 返回数字的绝对值。
- `num | filesizeformat -> String` – 将整数转换为人类可读的文件大小（如 110 MB）。
- `str | date(format) -> String` – 将时间戳转换为格式化的日期字符串。例如 <span v-pre>`{{ ts | date(format="%Y-%m-%d") }}`</span>。时间格式列表请参阅 [`chrono` 文档](https://docs.rs/chrono/latest/chrono/format/strftime/index.html)。
- `str | split(pat) -> Array` – 按指定模式分割字符串并返回子字符串数组。
- `str | default(value) -> String` – 如果变量未定义或为空则返回默认值。

Tera 提供更多过滤器。请阅读 [tera 文档](https://keats.github.io/tera/docs/#built-in-filters)了解更多。

#### 哈希

- `str | hash([algorithm], [len]) -> String` – 为输入字符串生成哈希值。
  - `algorithm: "sha256" | "blake3"`：使用的哈希算法（默认：`"sha256"`）
  - `len: usize`：将哈希字符串截断到指定长度
  - 示例：
    - <span v-pre>`{{ "foo" | hash }}`</span> – SHA256 哈希（默认）
    - <span v-pre>`{{ "foo" | hash(algorithm="blake3") }}`</span> – BLAKE3 哈希
    - <span v-pre>`{{ "foo" | hash(len=8) }}`</span> – SHA256 哈希截断到 8 个字符
- `path | hash_file([len]) -> String` – 返回给定路径文件的 BLAKE3 哈希值。
  - `len: usize`：将哈希字符串截断到指定长度

#### 路径操作

- `path | absolute -> String` – 将输入路径转换为绝对路径。不要求路径实际存在。
- `path | canonicalize -> String` – 将输入路径转换为绝对路径的规范形式。路径不存在时抛出错误。
- `path | basename -> String` – 从路径中提取文件名。例如 `/foo/bar/baz.txt` 变为 `baz.txt`。
- `path | file_size -> String` – 返回文件大小（字节）。
- `path | dirname -> String` – 返回文件的目录路径。例如 `/foo/bar/baz.txt` 变为 `/foo/bar`。
- `path | basename -> String` – 返回文件的基本名称。例如 `/foo/bar/baz.txt` 变为 `baz.txt`。
- `path | extname -> String` – 返回文件扩展名。例如 `/foo/bar/baz.txt` 变为 `.txt`。
- `path | file_stem -> String` – 返回不含扩展名的文件名。例如 `/foo/bar/baz.txt` 变为 `baz`。
- `path | file_size -> String` – 返回文件大小（字节）。
- `path | last_modified -> String` – 返回文件的最后修改时间。
- `path[] | join_path -> String` – 将路径数组连接为单个路径。

例如，你可以使用 `split()`、`concat()` 和 `join_path` 过滤器来构造文件路径：

```toml
[env]
PROJECT_CONFIG = "{{ [config_root] | concat(with='bar.txt') | join_path }}"
```

#### 字符串操作

- `str | quote -> String` – 对字符串加引号。将 `'` 转换为 `\'` 然后加引号，如 `'it\'s str'`。
- `str | kebabcase -> String` – 将字符串转换为 kebab-case
- `str | lowercamelcase -> String` – 将字符串转换为 lowerCamelCase
- `str | uppercamelcase -> String` – 将字符串转换为 UpperCamelCase
- `str | snakecase -> String` – 将字符串转换为 snake_case
- `str | shoutysnakecase -> String` – 将字符串转换为 SHOUTY_SNAKE_CASE

### 测试

Tera 提供了许多[内置测试](https://keats.github.io/tera/docs/#built-in-tests)。部分测试：

- `defined` - 如果变量已定义则返回 `true`。
- `string` - 如果变量是字符串则返回 `true`。
- `number` - 如果变量是数字则返回 `true`。
- `starting_with` - 如果变量是字符串且以给定参数开头则返回 `true`。
- `ending_with` - 如果变量是字符串且以给定参数结尾则返回 `true`。
- `containing` - 如果变量包含给定参数则返回 `true`。
- `matching` - 如果变量是字符串且匹配参数中的正则表达式则返回 `true`。

Tera 提供更多测试。请阅读 [tera 文档](https://keats.github.io/tera/docs/#built-in-tests)了解更多。

mise 提供额外的测试：

- `if path is dir` – 检查给定路径是否为目录。
- `if path is file` – 检查路径是否指向文件。
- `if path is exists` – 检查路径是否存在。
