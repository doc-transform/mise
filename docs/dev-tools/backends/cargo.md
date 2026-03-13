# Cargo 工具源

你可以直接从 [Cargo Crates](https://crates.io/) 安装包，即使没有对应的 asdf 插件也可以。

相关代码位于 mise 仓库的 [`./src/backend/cargo.rs`](https://github.com/jdx/mise/blob/main/src/backend/cargo.rs)。

## 依赖

需要先安装 `cargo`。你可以通过 [rustup](https://rustup.rs/) 在系统上安装：

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

或者通过 mise 安装：

```sh
mise use -g rust
```

## 用法

以下命令安装最新版本的 [eza](https://crates.io/crates/eza) 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g cargo:eza
$ eza --version
eza - A modern, maintained replacement for ls
v0.17.1 [+git]
https://github.com/eza-community/eza
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"cargo:eza" = "latest"
```

### 使用 Git

你可以使用 `mise` 命令从 Git 仓库安装任何包。这允许你安装特定的 tag、分支或 commit：

```sh
# 安装特定 tag
mise use cargo:https://github.com/username/demo@tag:<release_tag>

# 安装分支的最新版本
mise use cargo:https://github.com/username/demo@branch:<branch_name>

# 安装特定 commit
mise use cargo:https://github.com/username/demo@rev:<commit_hash>
```

这会执行带有相应 Git 选项的 `cargo install` 命令。

## 设置

通过 `mise settings set [VARIABLE] [VALUE]` 或设置对应的环境变量进行配置。

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="cargo" :level="3" />

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `cargo` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `features`

安装额外的组件（作为 `cargo install --features` 传递）：

```toml
[tools]
"cargo:cargo-edit" = { version = "latest", features = "add" }
```

### `default-features`

禁用默认 features（作为 `cargo install --no-default-features` 传递）：

```toml
[tools]
"cargo:cargo-edit" = { version = "latest", default-features = false }
```

### `bin`

当存在多个可执行文件时，选择要安装的 CLI 二进制文件名（作为 `cargo install --bin` 传递）：

```toml
[tools]
"cargo:https://github.com/username/demo" = { version = "tag:v1.0.0", bin = "demo" }
```

### `crate`

当存在多个 crate 时，选择要安装的 crate 名称（作为 `cargo install --git=<repo> <crate>` 传递）：

```toml
[tools]
"cargo:https://github.com/username/demo" = { version = "tag:v1.0.0", crate = "demo" }
```

### `locked`

构建 CLI 时使用 Cargo.lock（传递 `cargo install --locked`）。这是默认行为，传入 `false` 可以禁用：

```toml
[tools]
"cargo:https://github.com/username/demo" = { version = "latest", locked = false }
```
