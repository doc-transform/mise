# Shell 别名

mise 可以管理 shell 别名，当你进入目录时动态设置，离开时取消设置，类似于环境变量的工作方式。

## 配置

Shell 别名在 `mise.toml` 的 `[shell_alias]` 部分定义：

```toml
[shell_alias]
ll = "ls -la"
la = "ls -A"
gs = "git status"
gc = "git commit"
```

当你进入包含此配置的目录时，这些别名会自动在你的 shell 中设置。当你离开该目录（且新目录没有相同的别名）时，它们会被取消设置。

## 支持的 Shell

Shell 别名目前支持：

- **bash** - 使用 `alias`/`unalias` 命令
- **zsh** - 使用 `alias`/`unalias` 命令
- **fish** - 使用 `alias`/`functions -e` 命令

其他 shell（nushell、elvish、xonsh、powershell）暂不支持 shell 别名。

## 动态行为

Shell 别名的工作方式类似于 mise 管理的环境变量：

1. **进入时设置**：当你 `cd` 进入包含 `[shell_alias]` 配置的目录时，别名被设置
2. **变更时更新**：如果配置中的别名值发生变化，它会被更新
3. **离开时取消**：当你离开该目录（或别名从配置中移除）时，它会被取消设置

```bash
$ cd ~/myproject
# mise 设置: alias ll='ls -la'

$ ll
# 执行: ls -la

$ cd ~
# mise 执行: unalias ll
```

## 层级结构

与其他 mise 配置一样，父目录的 shell 别名在子目录中也可用。子目录可以覆盖父目录的别名：

```toml
# ~/projects/mise.toml
[shell_alias]
build = "make build"

# ~/projects/myapp/mise.toml
[shell_alias]
build = "npm run build"  # 覆盖父目录的别名
```

## 模板

别名值支持[模板](/templates)，可以使用动态值：

```toml
[shell_alias]
proj = "cd {{config_root}}"
node_version = "echo {{exec(command='node --version')}}"
```

## 使用场景

### 项目专属快捷方式

定义仅在特定项目中有意义的快捷方式：

```toml
[shell_alias]
dev = "npm run dev"
test = "npm test"
build = "npm run build"
deploy = "./scripts/deploy.sh"
```

### 工具包装器

创建带有项目特定默认值的工具别名：

```toml
[shell_alias]
docker-compose = "docker compose -f docker-compose.dev.yml"
terraform = "terraform -chdir=./infrastructure"
```

### 快速导航

```toml
[shell_alias]
src = "cd {{config_root}}/src"
tests = "cd {{config_root}}/tests"
docs = "cd {{config_root}}/docs"
```

## 与工具别名的区别

mise 有两种不同的别名功能，用途各异：

| 功能             | 用途                                                   | 配置键            |
| --------------- | ----------------------------------------------------- | ---------------- |
| **Shell 别名**   | 定义 shell 命令快捷方式（`alias ll='ls -la'`）            | `[shell_alias]`  |
| **工具别名**     | 定义工具的版本别名（`node@lts` → `20.x`）                | `[tool_alias]`   |

参阅[工具别名](/dev-tools/aliases)了解工具版本别名的文档。
