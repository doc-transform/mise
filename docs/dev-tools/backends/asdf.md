# asdf 工具源

::: warning
asdf 插件被视为旧版方案。对于新工具，建议优先使用 [vfox 插件](/dev-tools/backends/vfox.html)，它们使用 Lua 编写、跨平台（包括 Windows），并且内置了 HTTP、JSON、HTML 解析等模块。
:::

`asdf` 是 mise 最早的工具源。

它依赖每个工具对应的 asdf 插件。asdf 插件使用风险较高，因为它们通常由与工具供应商无关的单个开发者编写。而且由于它们是用 bash 编写的，在 Windows 上通常无法运行，因为 Windows 上 bash 往往不可用，脚本一般也不是跨平台编写的。

[注册表](https://github.com/jdx/mise/blob/main/registry/)中的工具会尽量避免使用 asdf 插件。有时无法使用 aqua/github 等更安全的工具源，因为某些工具有复杂的安装流程或需要导出环境变量。

所有这些插件都托管在 mise-plugins 组织中以保障供应链安全，你不需要依赖除我以外的任何人维护的插件。

由于 asdf 工具的额外复杂性和安全顾虑，我们正在积极将注册表中的工具从 asdf 迁移到 aqua 和 github 等不需要插件的工具源。不过，如果工具有特殊的安装流程或需要设置 `PATH` 以外的环境变量，就无法使用 github/aqua。

## 功能对比：asdf vs vfox

| 功能                     | asdf 插件         | vfox 插件            |
| ------------------------ | ----------------- | -------------------- |
| **语言**                 | Bash 脚本         | Lua                  |
| **Windows 支持**         | ❌                | ✅                   |
| **内置 HTTP 模块**       | ❌（需要 curl）   | ✅                   |
| **内置 JSON 模块**       | ❌（需要 jq）     | ✅                   |
| **内置 HTML 解析**       | ❌                | ✅                   |
| **内置归档文件解压**     | ❌                | ✅                   |
| **内置 semver 模块**     | ❌                | ✅                   |
| **内置日志**             | ❌                | ✅                   |
| **安装后钩子**           | ❌                | ✅                   |
| **安全证明**             | ❌                | ✅（cosign, SLSA）   |
| **多工具插件**           | ❌                | ✅（工具源插件）     |
| **Lock 文件支持**        | ❌                | ✅                   |
| **滚动版本校验和**       | ❌                | ✅                   |

## 钩子迁移：asdf 到 vfox

| asdf 脚本                    | vfox 钩子                | 说明                                                             |
| ---------------------------- | ------------------------ | ---------------------------------------------------------------- |
| `bin/list-all`               | `Available`              | 返回结构化的版本对象，而非纯文本                                 |
| `bin/download`               | `PreInstall`             | 返回 URL 和校验和；下载由 mise 处理                              |
| `bin/install`                | `PostInstall`            | 在 mise 下载并解压工具之后运行                                   |
| `bin/exec-env`               | `EnvKeys`                | 返回结构化的键值对，而非 `export` 语句                           |
| `bin/list-legacy-filenames`  | `PLUGIN.legacyFilenames` | 在 `metadata.lua` 中设置，而非使用脚本                           |
| `bin/parse-legacy-file`      | `ParseLegacyFile`        | 返回结构化结果，而非纯文本                                       |

## 编写 asdf（旧版）插件

请参阅 asdf 文档获取更多关于[编写插件](https://asdf-vm.com/plugins/create.html)的信息。
