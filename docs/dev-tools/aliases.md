# 工具别名

::: tip
`[alias]` 已更名为 `[tool_alias]`，以便与 `[shell_alias]` 区分。旧的 `[alias]` 键仍然有效，但已弃用。

关于 shell 命令别名（如 `alias ll='ls -la'`），请参阅 [Shell 别名](/shell-aliases)。
:::

## 工具源别名

可以为工具设置别名，例如将 `node`（默认映射到 `core:node`）改为 `asdf:company/our-custom-node`。

```toml [~/.config/mise/config.toml]
[tool_alias]
node = 'asdf:company/our-custom-node' # https://github.com/company/our-custom-node 的简写
erlang = 'asdf:https://github.com/company/our-custom-erlang'
```

## 版本别名

mise 支持为运行时版本设置别名。一个常见用途是为运行时的 LTS 版本定义别名。例如，你可能想将 `lts-hydrogen` 指定为 <node@20.x> 的别名，这样就可以在 `mise.toml`/`.tool-versions` 中使用 `node lts-hydrogen`。

用户别名可以在 `~/.config/mise/config.toml` 中添加 `tool_alias.<PLUGIN>` 节来创建：

```toml
[tool_alias.node.versions]
my_custom_20 = '20'
```

插件也可以通过 `bin/list-aliases` 脚本提供别名。以下是一个 Node.js 版本的示例：

```bash
#!/usr/bin/env bash

echo "lts-hydrogen 18"
echo "lts-gallium 16"
echo "lts-fermium 14"
```

::: info
由于这是 mise 特有的功能，目前 asdf 并未使用，所以现有插件中可能没有这个脚本。但插件作者可以添加它而不影响 asdf 用户。
:::

## 模板

别名值可以使用模板，详见[模板](/templates)。

```toml
[tool_alias.node.versions]
current = "{{exec(command='node --version')}}"
```
