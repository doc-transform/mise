# 预设

你可以利用 [mise 任务](../tasks/index.md) 创建自己的预设，以减少样板代码并简化新项目的搭建过程。

## Python 预设示例

以下是一个创建 Python 预设的示例，该预设会生成一个配合 `python` 和 `pdm` 使用的 `mise.toml` 文件：

```shell [~/.config/mise/tasks/preset/python]
#!/usr/bin/env bash
#MISE dir="{{cwd}}"

mise use pre-commit
mise config set env._.python.venv.path .venv
mise config set env._.python.venv.create true -t bool
mise tasks add lint -- pre-commit run -a
```

```shell [~/.config/mise/tasks/preset/pdm]
#!/usr/bin/env bash
#MISE dir="{{cwd}}"
#MISE depends=["preset:python"]
#USAGE arg "<version>"

mise use python@${usage_version?}
mise use pdm@latest
mise config set hooks.postinstall "pdm sync"
```

然后在任意目录中，你可以运行 `mise preset:pdm 3.10` 来搭建一个使用 `python` 和 `pdm` 的新项目：

```shell
cd my-project
mise preset:pdm 3.10
# [preset:python] $ ~/.config/mise/tasks/preset/python
# mise WARN  No untrusted config files found.
# mise ~/my-project/mise.toml tools: pre-commit@4.0.1
# [preset:pdm] $ ~/.config/mise/tasks/preset/pdm 3.10
# mise WARN  No untrusted config files found.
# mise ~/my-project/mise.toml tools: python@3.10.15
# mise ~/my-project/mise.toml tools: pdm@2.21.0
# mise creating venv with uv at: ~/my-project/.venv
# Using CPython 3.10.15 interpreter at: /Users/simon/.local/share/mise/installs/python/3.10.15/bin/python
# Creating virtual environment at: .venv
# Activate with: source .venv/bin/activate.fish

~/my-project via 🐍 v3.10.15 (.venv)
# 我们已经在虚拟环境中了 ^
```

以下是生成的 `mise.toml` 文件：

```toml [mise.toml]
[tools]
pdm = "latest"
pre-commit = "latest"
python = "3.10"

[hooks]
postinstall = "pdm sync"

[env]
[env._]
[env._.python]
[env._.python.venv]
path = ".venv"
create = true

[tasks.lint]
run = "pre-commit run -a"
```
