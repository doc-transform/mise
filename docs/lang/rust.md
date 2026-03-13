# Rust

Rust/cargo 的安装底层使用 rustup。如果 rustup 尚未安装，mise 会自动安装它，并添加所请求的目标。默认情况下，mise 遵循 `RUSTUP_HOME` 和 `CARGO_HOME` 环境变量作为主目录，如果未设置则回退到标准位置（`~/.rustup` 和 `~/.cargo`）。如果你想将 mise 的 rustup/cargo 与其他安装隔离，可以设置 `MISE_RUSTUP_HOME` 和 `MISE_CARGO_HOME` 环境变量。

与大多数工具不同，这些不会存在于 `~/.local/share/mise/installs` 中，因为它们由 rustup 管理。mise 所做的只是将 `RUSTUP_TOOLCHAIN` 环境变量设置为请求的版本，rustup 会在该版本不存在时自动安装。

## 用法

使用最新稳定版 rust：

```sh
mise use -g rust
cargo build
```

使用最新 beta 版 rust：

```sh
mise use -g rust@beta
cargo build
```

使用特定版本的 rust：

```sh
mise use -g rust@1.82
cargo build
```

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `rust` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `components`

`components` 选项允许你指定要安装的组件。多个组件可以用逗号分隔。可用的组件集可能因不同的发布和工具链而异。请查阅 Rust 文档获取最新的组件列表。

```toml
[tools]
"rust" = { version = "1.83.0", components = "rust-src,llvm-tools" }
```

### `profile`

`profile` 选项允许你指定要安装的发布配置。支持以下值：

- `minimal`：包含尽可能少的组件以获得一个可用的编译器（`rustc`、`rust-std` 和 `cargo`）
- `default`：包含 minimal 配置的所有组件，并添加 `rust-docs`、`rustfmt` 和 `clippy`
- `complete`：包含通过 `rustup` 可用的所有组件。不应使用此配置，因为它包含了元数据中曾经包含的每一个组件，因此几乎总是会失败

如果未设置，默认使用 `rustup` 中配置的配置文件。你可以通过运行 `rustup show profile` 查看当前默认值。

```toml
[tools]
"rust" = { version = "1.83.0", profile = "minimal" }
```

### `targets`

`targets` 选项允许你指定用于交叉编译的平台列表。多个目标可以用逗号分隔。

```toml
[tools]
"rust" = {
  version = "1.83.0",
  targets = "wasm32-unknown-unknown,thumbv2-none-eabi",
}
```

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="rust" :level="3" />
