# Mise + Ruby 实践手册

以下是使用 mise 管理 Ruby 项目的一些技巧。

## Ruby on Rails 项目

```toml [mise.toml]
min_version = "2024.9.5"

[env]
# 项目信息
PROJECT_NAME = "{{ config_root | basename }}"

[tools]
# 使用指定版本安装 Ruby
ruby = "{{ get_env(name='RUBY_VERSION', default='3.3.3') }}"

[tasks."bundle:install"]
description = "Install gem dependencies"
run = "bundle install"

[tasks.server]
description = "Start the Rails server"
alias = "s"
run = "rails server"

[tasks.test]
description = "Run tests"
alias = "t"
run = "rails test"

[tasks.lint]
description = "Run lint using Rubocop"
alias = "l"
run = "rubocop"
```
