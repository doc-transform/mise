# URL 替换

mise 不包含内置的制品下载注册表。它从远程注册表清单中获取工具的下载 URL。

在某些环境中——例如企业网络或 DMZ 区域——这些 URL 可能无法直接访问，必须通过代理或内部镜像访问。

URL 替换允许你修改或重定向 mise 尝试访问的任何 URL，从而可以使用内部代理、镜像或其他替代来源。

## 配置示例

在 mise.toml 中（单行）：

```toml
[settings]
url_replacements = { "example.com" = "mirror.example.com" }
```

在 mise.toml 中（多行）：

```toml
[settings.url_replacements]
"example.com" = "mirror.example.com"
"releases.hashicorp.com" = "hashicorp.example.com"
```

正则表达式示例：

```toml
[settings.url_replacements]
"regex:^http://(.+)" = "https://$1"
"regex:^https://github\\.com/([^/]+)/([^/]+)/releases/download/(.+)" = "https://hub.example.com/artifactory/github/$1/$2/$3"
```

## 简单的主机名替换

对于简单的基于主机名的镜像替换，键是要替换的原始主机名/域名，值是替换字符串。替换会在完整 URL 字符串（包括协议、主机名、路径和查询参数）中搜索并替换该模式。

示例：

- `github.com` -> `mirror.example.com` 替换 GitHub 主机名
- `https://github.com` -> `https://mirror.example.com` 带协议匹配，排除如 'api.github.com' 的情况
- `https://github.com` -> `https://proxy.example.com/github-mirror` 将 GitHub 替换为企业代理
- `http://example.net` -> `https://example.net` 将协议从 HTTP 替换为 HTTPS

参见[安全注意事项](#security-considerations)了解关于凭据处理的重要警告。

## 高级正则替换

对于更复杂的 URL 转换，可以使用正则表达式模式。当键以 `regex:` 开头时，它被视为正则表达式模式，可以匹配和转换 URL 的任何部分。值可以使用正则模式中的捕获组。

### 正则示例

#### 1. 协议转换（HTTP 到 HTTPS）

```toml
[settings]
url_replacements = {
  "regex:^http://(.+)" = "https://$1"
}
```

通过捕获 "http://" 后面的所有内容，将任何 HTTP URL 转换为 HTTPS。

#### 2. GitHub Release 镜像与路径重组

```toml
[settings]
url_replacements = {
  "regex:^https://github\\.com/([^/]+)/([^/]+)/releases/download/(.+)" =
    "https://hub.example.com/artifactory/github/$1/$2/$3"
}
```

将 `https://github.com/owner/repo/releases/download/v1.0.0/file.tar.gz`
转换为 `https://hub.example.com/artifactory/github/owner/repo/v1.0.0/file.tar.gz`

#### 3. 子域名转路径

```toml
[settings]
url_replacements = {
  "regex:^https://([^.]+)\\.cdn\\.example\\.com/(.+)" =
    "https://unified-cdn.example.com/$1/$2"
}
```

将基于子域名的 URL 转换为统一 CDN 上基于路径的 URL。

#### 4. 多个替换模式（按顺序处理）

```toml
[settings]
url_replacements = {
  "regex:^https://github\\.com/microsoft/(.+)" =
    "https://internal.example.org/microsoft/$1",
  "regex:^https://github\\.com/(.+)" =
    "https://public.example.org/github/$1",
  "releases.hashicorp.com" = "hashicorp.example.net"
}
```

第一条正则专门匹配 Microsoft 仓库，第二条匹配所有其他 GitHub URL，简单替换处理 HashiCorp。

## 使用场景

1. **企业镜像**：将公共下载 URL 替换为内部企业镜像
2. **自定义注册表**：将包下载重定向到自定义或私有注册表
3. **地理优化**：将下载路由到地理位置更近的镜像
4. **协议变更**：将 HTTP URL 转换为 HTTPS 或反之

## 正则语法

mise 使用 Rust 正则引擎，支持：

- `^` 和 `$` 锚点（字符串开头/结尾）
- `(.+)` 捕获组（在替换中使用 `$1`、`$2` 等）
- `[^/]+` 字符类（匹配除 `/` 外的任何字符）
- `\\.` 转义特殊字符（注意：TOML 中需要双反斜杠）
- `*`、`+`、`?` 量词
- `|` 选择

你可以在 regex101.com 上检查正则是否有效（参见[示例](https://regex101.com/r/rmcIE1/1)）。完整正则语法文档：<https://docs.rs/regex/latest/regex/#syntax>

## 优先级和匹配

- URL 替换按配置中出现的顺序处理（IndexMap 插入顺序）
- 正则模式（以 `regex:` 开头的键）和简单字符串替换按相同顺序处理
- 使用第一个匹配的模式；后续模式对该 URL 将被忽略
- 如果没有模式匹配，使用原始 URL

## 安全注意事项

使用正则模式时，请确保替换 URL 指向受信任的来源，因为此功能可以将工具下载重定向到任意位置。

> [!WARNING]
> **凭据泄露**：使用 `url_replacements` 时，为原始 URL（如 `api.github.com`）生成的任何认证头（如 `Authorization: Bearer <TOKEN>`）会被**保留**并发送到替换后的 URL。
>
> 这是有意为之的，目的是允许向转发请求到上游服务（GitHub、GitLab、Forgejo 等）的内部代理进行认证。但这意味着你**只能**将 URL 替换为受信任的服务器。重定向到不受信任的服务器会导致凭据泄露。
>
> **最佳实践**：在正则模式中使用 `^` 锚点确保匹配 URL 的开头。
>
> **不好的做法**：`"regex:github\\.com"`（会匹配 `evil-github.com`）
> **好的做法**：`"regex:^https://github\\.com"`（只匹配真正的 GitHub URL）

## 认证

URL 替换可以与 `~/.netrc`（Windows 上为 `~/_netrc`）配合使用来对替换后的 URL 进行认证。替换在 netrc 查找*之前*应用，因此你应该在 netrc 文件中使用*替换后*的 URL 的主机名。

例如，如果你的 `mise.toml` 中有：

```toml
[settings]
url_replacements = { "regex:^https://github\\.com" = "https://nexus.example.com" }
```

> [!NOTE]
> `.netrc` 中的凭据优先级更高，会**覆盖**任何默认认证头（如来自 `MISE_GITHUB_TOKEN` 或其他环境变量的头）。

你的 `~/.netrc` 应该这样写：

```netrc
machine nexus.example.com
  login myusername
  password mypassword
```
