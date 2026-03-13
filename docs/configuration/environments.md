# 配置环境

你可以在同一目录下为不同环境（如 `development` 和 `production`）使用不同的 `mise.toml` 文件。启用方法是通过以下方式将 `MISE_ENV` 设置为环境名（如 `development` 或 `production`）：

- CLI 参数：`-E development` 或 `--env development`
- 环境变量：`MISE_ENV=development`
- `.miserc.toml` 文件：`env = ["development"]`

mise 会在当前目录、父目录和 `MISE_CONFIG_DIR` 目录中查找 `mise.{MISE_ENV}.toml` 文件。

## 在 .miserc.toml 中设置 MISE_ENV

你可以在 `.miserc.toml` 文件中设置 `MISE_ENV`，该文件在其他配置文件被发现之前就会被加载。这允许你将环境配置提交到版本控制中：

```toml
# .miserc.toml
env = ["development"]
```

查找的文件位置（按优先级排列）：

1. 当前目录及父目录中的 `.miserc.toml` 和 `.config/miserc.toml`
2. `~/.config/mise/miserc.toml`（全局）
3. `/etc/mise/miserc.toml`（系统级）

注意：`MISE_ENV` 不能在 `mise.toml` 中设置，因为它决定了要加载哪些配置文件。

mise 还会在当前目录和父目录中查找"本地"文件，如 `mise.local.toml` 和 `mise.{MISE_ENV}.local.toml`。这些文件不应提交到版本控制中。（请将 `mise.local.toml` 和 `mise.*.local.toml` 添加到 `.gitignore`。）

这些文件的优先级如下（上方覆盖下方）：

- `mise.{MISE_ENV}.local.toml`
- `mise.local.toml`
- `mise.{MISE_ENV}.toml`
- `mise.toml`

如果设置了 `MISE_OVERRIDE_CONFIG_FILENAMES`，将使用该值代替以上所有规则。

你也可以使用 `mise/config.{MISE_ENV}.toml` 或 `.config/mise.{MISE_ENV}.toml` 等路径，其规则遵循[配置](/configuration)中的顺序。

运行 `mise config` 可以查看当前使用的配置文件。

写入操作的规则有所不同，因为最终需要选择一个文件写入。详见 [`mise use`](/cli/use.html) 的文档。

可以指定多个环境，例如 `MISE_ENV=ci,test`，后者优先级更高。
