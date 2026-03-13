# Mise + Node.js 实践手册

以下是使用 mise 管理 [Node.js](/lang/node.html) 项目的一些技巧。

## Node.js 入门

要在目录中安装 Node.JS，可以使用以下命令：

```shell
mise use node
```

这将安装最新版本的 Node.js，并创建一个包含以下内容的 `mise.toml` 文件：

```toml
node = "latest"
```

如果你想全局安装 Node.JS（例如 node v24），可以使用以下命令：

```shell
mise use -g node@24
```

## 将 node modules 二进制文件添加到 PATH

安装 `package.json` 中指定的 Node.js 包时，通常需要使用 `npx` 或二进制文件的完整路径。例如：

```shell
npm install --save eslint
eslint --version # 不生效
npx eslint --version # 生效
```

借助 `mise`，你可以将 node modules 的二进制文件添加到 `PATH` 中。这样通过 npm 安装的 CLI 工具无需 `npx` 即可直接使用。

```toml [mise.toml]
[env]
_.path = ['{{config_root}}/node_modules/.bin']
```

示例：

```shell
npm install --save eslint
eslint --version # 生效
```

## Node.js 项目示例

```toml [mise.toml]
min_version = "2024.9.5"

[env]
_.path = ['{{config_root}}/node_modules/.bin']

# 使用从当前目录派生的项目名称
PROJECT_NAME = "{{ config_root | basename }}"

# 设置 node module 二进制文件的路径
BIN_PATH = "{{ config_root }}/node_modules/.bin"

NODE_ENV = "{{ env.NODE_ENV | default(value='development') }}"

[tools]
# 使用指定版本安装 Node.js
node = "{{ env['NODE_VERSION'] | default(value='lts') }}"

# 按需全局安装一些 npm 包
"npm:typescript" = "latest"
"npm:eslint" = "latest"
"npm:jest" = "latest"

[tasks.install]
alias = "i"
description = "Install npm dependencies"
run = "npm install"

[tasks.start]
alias = "s"
description = "Start the development server"
run = "npm run start"

[tasks.lint]
alias = "l"
description = "Run ESLint"
run = "eslint src/"

[tasks.test]
description = "Run tests"
alias = "t"
run = "jest"

[tasks.build]
description = "Build the project"
alias = "b"
run = "npm run build"

[tasks.info]
description = "Print project information"
run = '''
echo "Project: $PROJECT_NAME"
echo "NODE_ENV: $NODE_ENV"
'''
```

## `pnpm` 示例

此示例使用 `pnpm` 作为包管理器。如果 lock 文件未更改，将跳过依赖安装。

```toml [mise.toml]
[tools]
node = '22'

[hooks]
# 启用 corepack 将安装 package.json 中指定的 `pnpm` 包管理器
# 或者，你也可以使用 mise 安装 `pnpm`
postinstall = 'npx corepack enable'

[settings]
# 必须启用此选项才能使 hooks 生效
experimental = true

[env]
_.path = ['{{config_root}}/node_modules/.bin']

[tasks.pnpm-install]
description = 'Installs dependencies with pnpm'
run = 'pnpm install'
sources = ['package.json', 'pnpm-lock.yaml', 'mise.toml']
outputs = ['node_modules/.pnpm/lock.yaml']

[tasks.dev]
description = 'Calls your dev script in `package.json`'
run = 'node --run dev'
depends = ['pnpm-install']
```

通过这个配置，在 NodeJS 项目中开始开发只需运行 `mise dev`：

- `mise` 将安装正确版本的 NodeJS
- `mise` 将启用 `corepack`
- `pnpm install` 会在 `node --run dev` 之前运行
