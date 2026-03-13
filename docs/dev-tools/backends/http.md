# HTTP 工具源

你可以使用 `http` 工具源直接从 HTTP URL 安装工具。此工具源从任何 HTTP/HTTPS URL 下载文件，非常适合通过直接下载链接分发预构建二进制文件或归档文件的工具。

相关代码位于 mise 仓库的 [`./src/backend/http.rs`](https://github.com/jdx/mise/blob/main/src/backend/http.rs)。

## 用法

以下命令从直接 HTTP URL 安装工具：

```sh
mise use -g http:my-tool[url=https://example.com/releases/my-tool-v1.0.0.tar.gz]@1.0.0
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"http:my-tool" = { version = "1.0.0", url = "https://example.com/releases/my-tool-v1.0.0.tar.gz" }
```

## 支持的 HTTP 语法

- **带 URL 参数的 HTTP：**`http:my-tool[url=https://example.com/releases/my-tool-v1.0.0.tar.gz]@1.0.0`

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `http` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `url`（必需）

指定下载工具的 HTTP URL。URL 支持使用 `version`、`os()` 和 `arch()` 等变量进行模板化：

```toml
[tools]
"http:my-tool" = { version = "1.0.0", url = "https://example.com/releases/my-tool-v{{version}}.tar.gz" }
```

你也可以使用不含模板的静态 URL：

```toml
[tools]
"http:my-tool" = { version = "1.0.0", url = "https://example.com/releases/my-tool-v1.0.0.tar.gz" }
```

#### 模板变量

以下模板函数可在 URL 中使用（使用双花括号，例如 `version` 写作 <code v-pre>{{version}}</code>）：

- `version` - 工具版本
- `os()` - 操作系统：`macos`、`linux` 或 `windows`
- `arch()` - 架构：`x64` 或 `arm64`
- `os_family()` - 操作系统系列：`unix` 或 `windows`

`os()` 和 `arch()` 函数支持重映射，以适应使用不同命名约定的工具：

```toml
[tools]
# HashiCorp 的工具使用 "darwin" 而非 "macos"，使用 "amd64" 而非 "x64"
"http:sentinel" = {
  version = "latest",
  url = 'https://releases.hashicorp.com/sentinel/{{version}}/sentinel_{{version}}_{{os(macos="darwin")}}_{{arch(x64="amd64")}}.zip',
}
```

生成的 URL 如下：

- macOS arm64：`sentinel_0.26.3_darwin_arm64.zip`
- macOS x64：`sentinel_0.26.3_darwin_amd64.zip`
- Linux x64：`sentinel_0.26.3_linux_amd64.zip`

### 特定平台的 URL

对于需要为不同平台提供不同下载的工具，使用表格格式：

```toml
[tools."http:my-tool"]
version = "1.0.0"

[tools."http:my-tool".platforms]
macos-x64 = { url = "https://example.com/releases/my-tool-v1.0.0-macos-x64.tar.gz" }
macos-arm64 = { url = "https://example.com/releases/my-tool-v1.0.0-macos-arm64.tar.gz" }
linux-x64 = { url = "https://example.com/releases/my-tool-v1.0.0-linux-x64.tar.gz" }
```

::: tip
平台键可以使用 `macos` 或 `darwin`，以及 `x64` 或 `amd64`。文档和示例中推荐使用 `macos` 和 `x64`，但所有变体都会被接受。

OS/架构值使用 mise 的命名约定：操作系统为 `linux`、`macos`、`windows`，架构为 `x64`、`arm64`。对于特定平台的 URL，使用适当的平台键（如 `macos-x64`、`linux-arm64`）并为每个平台指定完整的 URL。

如果你不小心使用了类似 `darwin-aarch64` 这样的写法，mise 会尝试理解你的意思并做出正确处理。
:::

### `checksum`

使用校验和验证下载的文件：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v1.0.0.tar.gz"
checksum = "sha256:a1b2c3d4e5f6789..."
```

_你也可以使用 [mise.lock](/dev-tools/mise-lock) 来管理校验和，而不是在此处指定。_

### 特定平台的校验和

```toml
[tools."http:my-tool"]
version = "1.0.0"

[tools."http:my-tool".platforms]
macos-x64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-macos-x64.tar.gz",
  checksum = "sha256:a1b2c3d4e5f6789...",
}
macos-arm64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-macos-arm64.tar.gz",
  checksum = "sha256:b2c3d4e5f6789...",
}
linux-x64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-linux-x64.tar.gz",
  checksum = "sha256:c3d4e5f6789...",
}
```

### `size`

验证下载文件的大小：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v1.0.0.tar.gz"
size = "12345678"
```

### 特定平台的大小

你可以为不同平台指定不同的大小：

```toml
[tools."http:my-tool"]
version = "1.0.0"

[tools."http:my-tool".platforms]
macos-x64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-macos-x64.tar.gz",
  size = "12345678",
}
macos-arm64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-macos-arm64.tar.gz",
  size = "9876543",
}
linux-x64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-linux-x64.tar.gz",
  size = "11111111",
}
```

### `strip_components`

解压归档文件时要去除的目录层级数：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v1.0.0.tar.gz"
strip_components = 1
```

::: info
如果未显式设置 `strip_components`，当解压的归档文件根目录下只有一个目录而没有文件时，mise 会自动应用 `strip_components = 1`。这在工具将二进制文件打包在版本目录中时很常见（如 `ripgrep-14.1.0-x86_64-unknown-linux-musl/rg`）。自动检测确保二进制文件被放置在 mise 期望的安装路径中。
:::

### `bin`

将下载的二进制文件重命名为特定名称。当下载的单个二进制文件有特定于平台的名称时很有用：

```toml
[tools."http:docker-compose"]
version = "2.29.1"
url = "https://github.com/docker/compose/releases/download/v{{ version }}/docker-compose-linux-x86_64"
bin = "docker-compose"  # 从 docker-compose-linux-x86_64 重命名为 docker-compose
```

::: info
下载单个二进制文件（非归档文件）时，mise 会自动去除文件名中的 OS/arch 后缀。例如，`docker-compose-linux-x86_64` 会自动变为 `docker-compose`。仅在需要特定自定义名称时才使用 `bin` 选项。
:::

### `rename_exe`

将归档文件内的可执行文件重命名为特定名称。当归档文件中的二进制文件有特定于平台的名称，或安装需要特定命名的 kubectl 插件时很有用：

```toml
[tools."http:openunison-cli"]
version = "1.0.0"
url = "https://nexus.tremolo.io/repository/openunison-cli/openunison-cli-v{{version}}-linux.zip"
rename_exe = "kubectl-openunison-cli"  # 为 kubectl 插件重命名提取的二进制文件
```

此选项会搜索解压目录（或指定的 `bin_path`）中的第一个可执行文件并将其重命名为指定的名称。

::: tip
对于单个二进制文件下载的重命名使用 `bin`，对于归档文件内可执行文件的重命名使用 `rename_exe`。
:::

### `format`

当 URL 没有文件扩展名或扩展名不正确时，显式指定归档格式：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v1.0.0"
format = "tar.xz"  # 显式指定格式
```

::: info
如果未指定 `format`，mise 会自动从 URL 中的文件扩展名检测格式。仅在 URL 没有正确扩展名或需要覆盖检测到的格式时才使用 `format`。
:::

### 特定平台的格式

你可以为不同平台指定不同的格式：

```toml
[tools."http:my-tool"]
version = "1.0.0"

[tools."http:my-tool".platforms]
macos-x64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-macos-x64",
  format = "tar.xz",
}
linux-x64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-linux-x64",
  format = "tar.gz",
}
windows-x64 = {
  url = "https://example.com/releases/my-tool-v1.0.0-windows-x64",
  format = "zip",
}
```

### `version_list_url`

从远程 URL 获取可用版本。这使得 `mise ls-remote` 能够列出基于 HTTP 的工具的可用版本：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v{{version}}.tar.gz"
version_list_url = "https://example.com/releases/versions.txt"
```

版本列表 URL 可以返回多种格式的数据：

- **纯文本**：单个版本号（如 `2.0.53`）
- **按行分隔**：每行一个版本
- **JSON 字符串数组**：`["1.0.0", "1.1.0", "2.0.0"]`
- **JSON 对象数组**：`[{"version": "1.0.0"}, {"tag_name": "v2.0.0"}]`
- **包含 versions 数组的 JSON 对象**：`{"versions": ["1.0.0", "2.0.0"]}`

版本前缀（如 `v`）会被自动去除。

### `version_regex`

使用正则表达式从版本列表 URL 的响应中提取版本：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v{{version}}.tar.gz"
version_list_url = "https://example.com/releases/"
version_regex = 'my-tool-v(\d+\.\d+\.\d+)\.tar\.gz'
```

使用第一个捕获组作为版本。如果没有捕获组，则使用整个匹配。

### `version_json_path`

使用类 jq 的路径表达式从 JSON 响应中提取版本：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v{{version}}.tar.gz"
version_list_url = "https://api.example.com/releases"
version_json_path = ".[].tag_name"
```

支持的路径表达式：

- `.` - 根值
- `.[]` - 遍历数组元素
- `.[].field` - 从每个数组元素中提取字段
- `.field` - 从对象中提取字段
- `.field[]` - 遍历字段中的数组
- `.field.subfield` - 嵌套字段访问
- `.data.versions[]` - 复杂嵌套路径
- `.[?field=value]` - 过滤字段等于指定值的数组元素

示例：

```toml
# GitHub releases API 格式
version_json_path = ".[].tag_name"

# 嵌套的 versions 数组
version_json_path = ".data.versions[]"

# Release info 对象
version_json_path = ".releases[].info.version"

# 仅过滤稳定版本（如 Flutter）
version_json_path = ".releases[?channel=stable].version"
```

过滤语法 `[?field=value]` 允许在提取之前过滤 JSON 数组。这在 API 返回多个发布渠道（stable、beta、dev）而你只需要特定渠道时很有用。

### `version_expr`

使用 [expr-lang](https://expr-lang.org/) 表达式提取版本。这为复杂的版本提取逻辑提供了最大的灵活性：

```toml
[tools."http:my-tool"]
version = "latest"
url = "https://example.com/releases/my-tool-v{{ version }}.tar.gz"
version_list_url = "https://example.com/versions.txt"
version_expr = 'split(body, "\n")'
```

表达式接收 HTTP 响应体作为 `body` 变量，应返回版本字符串数组。

表达式示例：

```toml
# 按换行符分割版本
version_expr = 'split(body, "\n")'

# 分割并过滤空行
version_expr = 'filter(split(body, "\n"), # != "")'

# 解析 JSON 并提取对象键（适用于 HashiCorp 风格的 JSON）
# 例如 {"versions": {"1.0.0": {}, "2.0.0": {}}}
version_expr = 'keys(fromJSON(body).versions)'
```

[expr-lang](https://expr-lang.org/) 库提供的内置函数包括：

- **`fromJSON(string)`**：将 JSON 字符串解析为值
- **`toJSON(value)`**：将值转换为 JSON 字符串
- **`keys(map)`**：以数组形式获取对象/映射的键
- **`values(map)`**：以数组形式获取对象/映射的值
- **`len(value)`**：获取字符串、数组或映射的长度

::: tip
如果同时指定了多个选项，`version_expr` 的优先级高于 `version_regex` 和 `version_json_path`。当其他选项的灵活性不够时使用它。
:::

### `bin_path`

指定解压归档文件中包含二进制文件的目录，或下载文件的放置位置。支持使用 `{{version}}` 进行模板化：

```toml
[tools."http:my-tool"]
version = "1.0.0"
url = "https://example.com/releases/my-tool-v1.0.0.tar.gz"
bin_path = "my-tool-{{version}}/bin" # 展开为 my-tool-1.0.0/bin
```

**二进制路径查找顺序：**

1. 如果指定了 `bin_path`，使用该目录
2. 如果未设置 `bin_path`，在安装路径中查找 `bin/` 目录
3. 如果不存在 `bin/` 目录，在子目录中搜索 `bin/` 目录
4. 如果未找到 `bin/` 目录，使用解压目录的根目录

## 缓存行为

HTTP 工具源实现了智能缓存系统，以优化磁盘使用和安装速度。

### 缓存位置

下载和解压的文件缓存在 `$MISE_CACHE_DIR/http-tarballs/` 中，而不是为每个工具安装单独存储。默认路径：

- **Linux**：`~/.cache/mise/http-tarballs/`
- **macOS**：`~/Library/Caches/mise/http-tarballs/`

### 缓存键生成

缓存键基于文件内容生成，确保相同的下载在不同工具之间共享：

1. **文件内容的 Blake3 哈希**：未提供校验和时，mise 计算下载文件的 Blake3 哈希
2. **解压选项**：`strip_components` 包含在缓存键中，因为它影响解压后的结构

缓存目录结构示例：

```
~/.cache/mise/http-tarballs/
├── 71f774faa03daf1a58cc3339f8c73e6557348c8e0a2f3fb8148cc26e26bad83f/
│   ├── extracted/
│   │   └── bin/my-tool
│   └── metadata.json
└── 1c2af379bdf1fed266bc44b49271e2df5b0dafae09f1cc744b3505ec50c84719_strip_1/
    ├── extracted/
    │   └── my-tool
    └── metadata.json
```

### 符号链接安装

工具安装是指向缓存解压内容的符号链接：

```bash
~/.local/share/mise/installs/http-my-tool/1.0.0 → ~/.cache/mise/http-tarballs/71f774.../extracted
```

这种方式提供了以下优势：

- **空间效率**：使用相同 tarball 的多个工具共享一个缓存副本
- **更快的安装**：缓存命中时无需重新下载和解压
- **一致性**：相同的文件内容始终使用相同的缓存条目

### 缓存元数据

每个缓存条目包含一个 `metadata.json` 文件，记录缓存内容的信息：

```json
{
  "url": "https://example.com/releases/my-tool-v1.0.0.tar.gz",
  "checksum": "sha256:a1b2c3d4e5f6789...",
  "size": 1024000,
  "extracted_at": 1703001234,
  "platform": "macos-arm64"
}
```

### 缓存管理

HTTP 工具源的缓存遵循 mise 的标准缓存管理：

- 可以使用 `mise cache clear` 清除缓存条目
- 缓存目录遵循 `MISE_CACHE_DIR` 环境变量
- **自动清理**：mise 会自动清理 30 天未使用的缓存条目
- 如需手动清理，可使用 `mise cache clear`
