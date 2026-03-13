# Mise + Python 实践手册

以下是使用 mise 管理 [Python](/lang/python.html) 项目的一些技巧。

## 使用 virtualenv 的 Python 项目

以下是一个包含 `requirements.txt` 文件的 Python 项目示例。

```toml [mise.toml]
min_version = "2024.9.5"

[env]
# 使用从当前目录派生的项目名称
PROJECT_NAME = "{{ config_root | basename }}"

# 自动激活虚拟环境
_.python.venv = { path = ".venv", create = true }

[tools]
python = "{{ get_env(name='PYTHON_VERSION', default='3.11') }}"
ruff = "latest"

[tasks.install]
description = "Install dependencies"
alias = "i"
run = "uv pip install -r requirements.txt"

[tasks.run]
description = "Run the application"
run = "python app.py"

[tasks.test]
description = "Run tests"
run = "pytest tests/"

[tasks.lint]
description = "Lint the code"
run = "ruff src/"

[tasks.info]
description = "Print project information"
run = '''
echo "Project: $PROJECT_NAME"
echo "Virtual Environment: $VIRTUAL_ENV"
'''
```

## mise + uv

如果你使用的是通过 `uv init .` 初始化的 `uv` 项目，以下是与 mise 配合使用的方法。

`uv` 项目的目录结构如下：

```shell [uv-project]
.
├── .gitignore
├── .python-version
├── main.py
├── pyproject.toml
└── README.md

cat .python-version
# 3.12
```

在 `uv` 项目中运行 `uv run main.py` 时，`uv` 会使用 `.python-version` 文件中指定的 Python 版本自动创建虚拟环境。同时还会创建一个 `uv.lock` 文件。

`mise` 会检测 `.python-version` 中的 Python 版本，但默认不会使用 `uv` 创建的虚拟环境。因此，使用 `which python` 会显示 `mise` 的全局 Python 安装路径。

```shell
mise i
which python
# ~/.local/share/mise/installs/python/3.12.4/bin/python
```

如果你希望 `mise` 使用 `uv` 创建的虚拟环境，可以在 `mise.toml` 文件中设置 [`python.uv_venv_auto`](/lang/python.html#python.uv_venv_auto) 选项。
使用 `"source"` 仅激活已存在的 `.venv`，或使用 `"create|source"` 在不存在时自动创建再激活。
如果你希望由 `mise prepare` 来创建 venv，请保持为 `"source"`，启用 `[prepare.uv]`，然后运行 `mise prepare`。

```toml [mise.toml]
[settings]
python.uv_venv_auto = "source"
# 或者，如果不存在则自动创建
# python.uv_venv_auto = "create|source"
```

现在使用 `which python` 将显示 `uv` 创建的虚拟环境中的 Python 版本。

```shell
which python
# ./uv-project/.venv/bin/python
```

另一种方式是在 `mise.toml` 文件中使用 `_.python.venv` 指定 `uv` 创建的虚拟环境路径。

```toml [mise.toml]
[env]
_.python.venv = { path = ".venv" }
```

### 同步 mise 和 uv 安装的 Python 版本

你可以使用 [mise sync python --uv](/cli/sync/python.html#uv) 来同步 `mise` 安装的 Python 版本与 `uv` 项目中 `.python-version` 文件指定的版本。

### uv 脚本

你可以在 toml 或文件任务的 [`shebang`](/tasks/toml-tasks.html#shell-shebang) 中利用 `uv run`。
注意，如果文件名不以 `.py` 结尾，则需要使用 `--script` 参数。

以下是一个 toml 任务示例：

```toml [mise.toml]
[tools]
uv = 'latest'

[tasks.print_peps]
run = '''
#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["requests<3", "rich"]
# ///

import requests
from rich.pretty import pprint

resp = requests.get("https://peps.python.org/api/peps.json")
data = resp.json()
pprint([(k, v["title"]) for k, v in data.items()][:10])
'''
```

或者作为文件任务：

```python [mise-tasks/print_peps.py]
#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["requests<3", "rich"]
# ///

import requests
from rich.pretty import pprint

resp = requests.get("https://peps.python.org/api/peps.json")
data = resp.json()
pprint([(k, v["title"]) for k, v in data.items()][:10])
```

然后可以使用 `mise run print_peps` 运行：

```shell
❯ mise run print_peps
[print_peps] $ ~/uv-project/mise-tasks/print_peps.py
Installed 9 packages in 8ms
[
│   ('1', 'PEP Purpose and Guidelines'),
│   ('2', 'Procedure for Adding New Modules'),
    #...
]
```
