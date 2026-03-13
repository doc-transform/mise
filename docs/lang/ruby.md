# Ruby

与 `rvm`、`rbenv` 或 `asdf` 类似，`mise` 可以在同一系统上管理多个版本的 [Ruby](https://www.ruby-lang.org/)。

> 以下是使用 ruby mise 核心插件的说明。当没有安装名为 "ruby" 的 git 插件时会使用核心插件。如果你想使用 [asdf-ruby](https://github.com/asdf-vm/asdf-ruby)，请使用 `mise plugins install ruby GIT_URL`。

相关代码位于 mise 仓库的
[`./src/plugins/core/ruby.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/ruby.rs)。

## 用法

以下命令安装最新版本的 ruby-3.2.x（如果尚未安装 3.2.x 的某个版本）并将其设为全局默认版本：

```sh
mise use -g ruby@3.2
```

mise 底层使用 [`ruby-build`](https://github.com/rbenv/ruby-build) 从源码编译 ruby。请确保安装了必要的[依赖](https://github.com/rbenv/ruby-build/wiki#suggested-build-environment)。你可以查看其 [README](https://github.com/rbenv/ruby-build/blob/master/README.md) 了解额外设置和一些故障排查方法。

## 预编译二进制文件

Mise 可以下载预编译的 Ruby 二进制文件，而不需要从源码编译。这显著减少了安装时间。

预编译二进制文件将在 2026.8.0 版本成为默认选项。要提前启用：

```sh
mise settings ruby.compile=false
mise use ruby@3.4.1
```

预编译二进制文件来源于 [jdx/ruby](https://github.com/jdx/ruby)，可用于以下平台：

- macOS（仅 arm64/Apple Silicon）
- Linux arm64
- Linux x86_64

如果你的平台或 Ruby 版本没有可用的预编译二进制文件，mise 会自动回退到使用 ruby-build 从源码编译。

要始终从源码编译（即使有预编译二进制文件可用）：

```sh
mise settings ruby.compile=true
```

你还可以通过将 `ruby.precompiled_url` 设置为 GitHub 仓库（如 `owner/repo`）或完整的 URL 模板来自定义预编译二进制文件的来源。

你也可以安装特定的 ruby 风味。要获取某个风味的最新版本，只需使用风味前缀即可。

```sh
mise use -g ruby@truffleruby            # 最新版 truffleruby
```

## 默认 gem

mise 可以在安装新 ruby 版本后自动安装一组默认的 gem。要启用此功能，提供一个 `$HOME/.default-gems` 文件，每行列出一个 gem，例如：

```text
# 支持注释
pry
bcat ~> 0.6.0 # 支持版本约束
rubocop --pre # 安装预发布版本
```

## `.ruby-version` 和 `Gemfile` 支持

mise 使用 `mise.toml` 或 `.tool-versions` 文件在不同软件版本之间自动切换。不过，它也可以读取 ruby 专用的版本文件 `.ruby-version` 或 `Gemfile`（如果其中指定了 ruby 版本）。

为当前版本的 ruby 创建 `.ruby-version` 文件：

```sh
ruby -v > .ruby-version
```

启用 ruby 的惯用版本文件读取：

```sh
mise settings add idiomatic_version_file_enable_tools ruby
```

更多信息请参阅[惯用版本文件](/configuration.html#idiomatic-version-files)。

## 手动更新 ruby-build

ruby-build 应该每天自动更新，但如果你发现某些版本还不存在，可以强制更新：

```bash
mise cache clean
mise ls-remote ruby
```

## 设置

`ruby-build` 已有一些[内置设置](https://github.com/rbenv/ruby-build?tab=readme-ov-file#custom-build-configuration)，此外 mise 还有一些额外设置：

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="ruby" :level="3" />
