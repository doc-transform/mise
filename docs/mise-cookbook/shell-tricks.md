# Shell 技巧

利用 mise 的 shell 实用工具集合。

## 提示符变色

在 ZSH 中，当 mise 更新环境时（例如 cd 进入项目目录，或修改 .mise\*.toml 文件），可以设置提示符颜色：

```shell
# 像平常一样激活 mise
source <(command mise activate zsh)

typeset -i _mise_updated

# 替换默认的 mise hook
function _mise_hook {
  local diff=${__MISE_DIFF}
  source <(command mise hook-env -s zsh)
  [[ ${diff} == ${__MISE_DIFF} ]]
  _mise_updated=$?
}

_PROMPT="❱ "  # 或 _PROMPT=${PROMPT} 保持默认值

function _prompt {
  if (( ${_mise_updated} )); then
    PROMPT='%F{blue}${_PROMPT}%f'
  else
    PROMPT='%(?.%F{green}${_PROMPT}%f.%F{red}${_PROMPT}%f)'
  fi
}

add-zsh-hook precmd _prompt
```

现在，当 mise 对环境进行任何更新时，提示符将变为蓝色。

## 在 powerline-go 提示符中显示当前配置环境

[powerline-go](https://github.com/justjanne/powerline-go) 的 `shell-var` 段可以用于在提示符中显示环境变量的值。当前 mise 的[配置环境](/configuration/environments) `MISE_ENV` 非常适合用于此目的。

大体上操作符合预期：在 `-modules` 中包含 `shell-var`，在参数中添加 `-shell-var MISE_ENV -shell-var-no-warn-empty`，并确保 `MISE_ENV` 已导出，以便 `powerline-go` 能够"看到"它。

截至 2025 年 2 月，有一个需要注意的问题：`shell-var` 模块无法处理*未设置*（与空值不同）的环境变量。作为解决方法，可以在 shell 启动脚本的早期将 `MISE_ENV` 设置为空值，并避免手动 `unset` 它。例如在 bash 中，通常在 `~/.bashrc` 中添加：

```bash
export MISE_ENV=
```

## 检查 mise hook 后的变更内容

使用 record-query 可以检查 `__MISE_DIFF` 和 `__MISE_SESSION` 变量，查看 mise hook 对环境所做的更改。

```toml [~/.config/mise/config.toml]
[tools]
"cargo:record-query" = "latest"
```

```shell
function mise_parse_env {
  rq -m < <(
    zcat -q < <(
      printf $'\x1f\x8b\x08\x00\x00\x00\x00\x00'
      base64 -d <<< "$1"
    )
  )
}
```

```shell
$ mise_parse_env "${__MISE_DIFF}"
{
  "new": {
    ...
  },
  "old": {
    ...
  },
  "path": [
    ...
  ]
}
```
