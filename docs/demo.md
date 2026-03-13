# 演示

以下演示展示了：

- 如何使用 `mise exec` 以指定版本运行工具
- 如何用 `mise` 安装和管理 `jq`、`terraform`、`go` 等各种工具
- 如何用 `mise` 在同一系统上管理多个 `node` 版本

<video style="max-width: 100%; height: auto;" controls="controls" src="./tapes/demo.mp4" />

## 操作记录

`mise exec <tool> -- <command>` 可以让你通过 mise 运行任意工具

```shell
mise exec node@24 -- node -v
# mise node@24.x.x ✓ installed
# v24.x.x
```

此时 node 仅在 mise 环境中可用，并非全局安装

```shell
node -v
# bash: node: command not found
```

---

再来一个例子，通过 `mise exec` 运行 terraform

```shell
mise exec terraform -- terraform -v
# mise terraform@1.11.3 ✓ installed
# Terraform v1.11.3
```

---

`mise exec` 非常适合运行一次性命令，但激活 mise 会更方便。激活后，mise 会自动更新 `PATH`，让已安装的工具可以直接使用。

先安装 node@lts 并设为全局默认版本

```shell
mise use --global node@lts
# v22.14.0
```

```shell
node -v
# v22.14.0
```

```shell
which node
# /root/.local/share/mise/installs/node/22.14.0/bin/node
```

注意这里返回的是真实的 node 路径，而不是 shim。

---

我们还可以用 mise 安装其他工具。例如安装 terraform、jq 和 go

```shell
mise use -g terraform jq go
# mise jq@1.7.1 ✓ installed
# mise terraform@1.11.3 ✓ installed
# mise go@1.24.1 ✓ installed
# mise ~/.config/mise/config.toml tools: go@1.24.1, jq@1.7.1, terraform@1.11.3
```

```shell
terraform -v
# Terraform v1.11.3
```

```shell
jq --version
# jq-1.7
```

```shell
go version
# go version go1.24.1 linux/amd64
```

```shell
mise ls
# Tool       Version  Source                      Requested
# go         1.24.1   ~/.config/mise/config.toml  latest
# jq         1.7.1    ~/.config/mise/config.toml  latest
# node       22.14.0  ~/.config/mise/config.toml  lts
# terraform  1.11.3   ~/.config/mise/config.toml  latest
```

---

进入一个项目目录，为它设置 node@23

```shell
cd myproj
mise use node@23 pnpm@10
# mise node@23.10.0 ✓ installed
# mise pnpm@10.7.0 ✓ installed
```

```shell
node -v
# v23.10.0
pnpm -v
# 10.7.0
```

如预期一样，`node -v` 现在是 v23.x

```shell
cat mise.toml
# [tools]
# node = "23"
# pnpm = "10"
```

离开这个目录后，node 版本会恢复为全局的 LTS 版本

```shell
cd ..
node -v
# v22.14.0
```
