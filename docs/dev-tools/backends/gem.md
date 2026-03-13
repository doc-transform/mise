# gem 工具源

mise 可以用来安装 RubyGems 上的 CLI 工具。相关代码位于 mise 仓库的 [`./src/backend/gem.rs`](https://github.com/jdx/mise/blob/main/src/backend/gem.rs)。

## 依赖

需要安装 `gem`（随 ruby 一起提供）。你可以选择是否通过 mise 安装。
以下是通过 mise 安装 `ruby` 的方式：

```sh
mise use -g ruby
```

## 用法

以下命令安装最新版本的 [rubocop](https://rubygems.org/gems/rubocop) 并将其设为 PATH 中的活跃版本：

```sh
mise use -g gem:rubocop
rubocop --version
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"gem:rubocop" = "latest"
```

## Ruby 升级

如果 gem 包使用的 ruby 版本发生变化（通过 mise 或系统 ruby），你可能需要重新安装 gem。可以这样操作：

```sh
mise install -f gem:rubocop
```

或者重新安装所有 gem：

```sh
mise install -f "gem:*"
```

## 设置

通过 `mise settings set [VARIABLE] [VALUE]` 或设置对应的环境变量进行配置。

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="gem" :level="3" />
