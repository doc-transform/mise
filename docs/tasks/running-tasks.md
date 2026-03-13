# 运行任务

使用 `mise tasks` 查看可用任务。要显示 `hide=true` 的隐藏任务，使用 `--hidden` 选项。

使用 `mise tasks deps [tasks]...` 列出任务的依赖关系。

使用 `mise tasks run <task>`、`mise run <task>`、`mise r <task>` 或直接 `mise <task>` 来运行任务——不过最后一种方式不建议在脚本或文档中使用，因为如果 mise 将来添加了同名命令，任务会被覆盖，必须使用其他形式运行。

大多数 mise 用户会为 `mise run` 设置别名，如 `alias mr='mise run'`。

默认情况下，任务最多以 4 个并行任务执行。通过 `--jobs` 选项、`jobs` 设置或 `MISE_JOBS` 环境变量自定义。输出通常按行显示，并以任务标签为前缀。通过逐行打印，我们避免了并行执行时输出交错。但如果 --jobs == 1，输出将设为 `interleave`。

要直接输出 stdout/stderr，使用 `--interleave`、`task.output` 设置或 `MISE_TASK_OUTPUT=interleave`。

默认不读取 stdin。要启用，请在需要的任务上设置 `raw = true`。这将阻止该任务与其他任务并行运行——此时会获取 RWMutex 的写锁。这也会阻止对输出进行脱敏。

额外的参数会传递给任务，例如，如果我们想以 release 模式运行：

```bash
mise run build --release
```

如果有多个命令，参数只传递给最后一个命令。

::::tip
你可以为任务定义参数/标志，提供验证、解析、自动补全和文档功能。

- [文件任务中的参数](/tasks/file-tasks#arguments)
- [TOML 任务中的参数](/tasks/toml-tasks#arguments)

如果安装了 `usage` CLI 且 mise 补全功能正常，任务的自动补全将自动生效。

可以使用 [`mise generate task-docs`](/cli/generate/task-docs) 生成 Markdown 文档。
::::

多个任务/参数可以用 `:::` 分隔符分开：

```bash
mise run build arg1 arg2 ::: test arg3 arg4
```

如果未指定任务名称，mise 将运行名为 "default" 的任务——前提是你已创建了一个。你也可以将其他任务设置别名为 "default"。

```bash
mise run
```

## 任务分组

任务可以使用 `:` 分隔的名称前缀进行语义分组。例如，所有测试相关的任务可以以 `test:` 开头。还可以使用嵌套分组进一步细化分组并简化模式匹配。例如，运行 `mise run test:**:local` 将匹配 `test:units:local`、`test:integration:local` 和 `test:e2e:happy:local`（参阅[通配符](#wildcards)了解更多信息）。

## 通配符

运行任务或指定任务依赖时支持 Glob 风格的通配符。

可用的通配符模式：

- `?` 匹配任意单个字符
- `*` 匹配 0 个或多个字符
- `**` 匹配 0 个或多个组
- `{glob1,glob2,...}` 匹配任意逗号分隔的 glob 模式
- `[ab,...]` 匹配任意字符或范围 `[a-z]`
- `[!ab,...]` 匹配不在字符集中的任意字符

### 示例

`mise run generate:{completions,docs:*}`

与依赖一起使用：

```toml
[tasks."lint:eslint"] # 使用 ":" 意味着需要加引号
run = "eslint ."
[tasks."lint:prettier"]
run = "prettier --check ."
[tasks.lint]
depends = ["lint:*"]
wait_for = ["render"] # 不作为依赖添加，但如果已在运行则等待完成
```

## 基于文件变化运行

通常只在任务使用的文件发生变化时才执行任务会很方便。例如，我们可能只想在 ".rs" 文件变化时运行 `cargo build`。可以通过以下配置实现：

```toml
[tasks.build]
description = 'Build the CLI'
run = "cargo build"
sources = ['Cargo.toml', 'src/**/*.rs'] # 如果这些文件没有变化则跳过运行
outputs = ['target/debug/mycli']
```

如果 `target/debug/mycli` 比 `Cargo.toml` 或任何 ".rs" 文件更新，任务将被跳过。这使用最后修改时间戳，添加校验和支持也不困难。

## 监视文件

使用 [`mise watch`](/cli/watch.html) 在源文件变化时运行任务：

```bash
mise watch build
```

目前，这只是调用 `watchexec`（你可以用任何方式安装它，包括使用 mise：`mise use -g watchexec@latest`。未来可能会改变。）

## `mise run` 简写

任务可以用 `mise run <TASK>` 或 `mise <TASK>` 运行——如果名称不与 mise 命令冲突。因为 mise 将来可能添加同名命令，建议在脚本和文档中使用 `mise run <TASK>`。

## 执行顺序

你可以使用 [depends](/tasks/task-configuration.html#depends)、[wait_for](/tasks/task-configuration.html#wait-for) 和 [depends_post](/tasks/task-configuration.html#depends-post) 来控制执行顺序。

```toml
[tasks.build]
run = "echo 'build'"

[tasks.test]
run = "echo 'test'"
depends = ["build"]
```

这将确保 `build` 任务在 `test` 任务之前运行。

你也可以定义一个 mise 任务来按顺序或并行运行其他任务：

```toml
[tasks.example1]
run = "echo 'example1'"

[tasks.example2]
run = "mise example2"

[tasks.example3]
run = "echo 'example3'"

[tasks.one_by_one]
run = [
    { task = "example1" }, # 等待 example1 完成后再运行下一步
    { tasks = ["example2", "example3"] }, # 这两个并行运行
]
```
