# 持续集成

你可以在 CI 环境中使用 mise 来为项目配置所需的工具。
建议在项目中将工具锁定到特定版本，以确保环境可复现。

## 通用 CI 环境

CI 流水线支持运行任意命令。你可以用以下方式安装 mise 并通过 `mise install` 安装工具：

```yaml
script: |
  curl https://mise.run | sh
  mise install
```

为了确保运行的是 mise 安装的工具版本，请通过 `mise x` 命令来执行：

```yaml
script: |
  mise x -- npm test
```

你也可以将 [shims](/dev-tools/shims.md) 目录添加到 `PATH`（如果 CI 环境支持的话）。

### Bootstrap 引导脚本

除了使用 `curl https://mise.run | sh`，还可以使用 [`mise generate bootstrap`](/cli/generate/bootstrap.html) 生成一个安装并运行 `mise` 的引导脚本。

```shell
mise generate bootstrap -l -w
```

将 `.mise/` 添加到 `.gitignore`，并提交生成的 `./bin/mise` 文件。之后你就可以在 CI 中直接使用 `./bin/mise` 来安装和运行 `mise`。

```yaml
script: |
  ./bin/mise install
  ./bin/mise x -- npm test
```

## GitHub Actions

如果你使用 GitHub Actions，我们提供了官方的 [mise-action](https://github.com/jdx/mise-action)，封装了 mise 和工具的安装流程。只需将 action 添加到工作流中：

```yaml
name: test
on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: jdx/mise-action@v3
        with:
          version: 2024.12.14 # [默认: latest] 要安装的 mise 版本
          install: true # [默认: true] 运行 `mise install`
          cache: true # [默认: true] 使用 GitHub 缓存来缓存 mise
          experimental: true # [默认: false] 启用实验性功能
          # 自动写入此 mise.toml 文件
          mise_toml: |
            [tools]
            shellcheck = "0.9.0"
          # 或者，如果你偏好 .tool-versions：
          tool_versions: |
            shellcheck 0.9.0
      - run: shellcheck scripts/*.sh
```

## GitLab CI

你可以使用任何预装了 `mise` 的 Docker 镜像来运行 CI 任务。
以下是使用 `debian-slim` 作为基础镜像的示例：
:::: details Dockerfile 示例

```dockerfile
FROM debian:12-slim

RUN apt-get update  \
    && apt-get -y --no-install-recommends install  \
      # 安装你需要的工具
      sudo curl git ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://mise.run | MISE_VERSION=v... MISE_INSTALL_PATH=/usr/local/bin/mise sh
```

::::

在配置任务时，你可以缓存部分 [mise 目录](/directories)。

```yaml
build-job:
  stage: build
  image: mise-debian-slim # 使用你创建的镜像
  variables:
    MISE_DATA_DIR: $CI_PROJECT_DIR/.mise/mise-data
  cache:
    - key:
        prefix: mise-
        files: ["mise.toml", "mise.lock"] # mise.lock 可选，仅在使用 `lockfile = true` 时需要
      paths:
        - $MISE_DATA_DIR
  script:
    - mise install
    - mise exec --command 'npm build'
```

### 使用 bootstrap 引导脚本

另一种方式是使用 [`mise generate bootstrap`](/cli/generate/bootstrap.html) 在 GitLab CI 中[引导安装](#bootstrapping) `mise`。

```
mise generate bootstrap -l -w
```

然后你可以使用一个通用的 Docker 镜像在 CI 中安装和运行 `mise`。

:::: details Dockerfile 示例

```dockerfile
FROM debian:12-slim

RUN apt-get update  \
    && apt-get -y --no-install-recommends install sudo curl git ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*
```

::::

以下是 `.gitlab-ci.yml` 配置示例：

```yaml
.mise-cache: &mise-cache
  key:
    prefix: mise-
    files: ["mise.toml", "./bin/mise"]
  paths:
    - .mise/installs
    - .mise/mise-2025.1.3

build-job:
  stage: build
  image: my-debian-slim-image # 使用你创建的镜像
  cache:
    - <<: *mise-cache
      policy: pull-push
  script:
    - ./bin/mise install
    - ./bin/mise exec --command 'npm build'
```

## Xcode Cloud

如果你使用 Xcode Cloud，可以通过自定义 `ci_post_clone.sh` [构建脚本](https://developer.apple.com/documentation/xcode/writing-custom-build-scripts)来安装 mise。示例：

```bash
#!/bin/sh
curl https://mise.run | sh
export PATH="$HOME/.local/bin:$PATH"

mise install # 安装 mise.toml 中的工具
eval "$(mise activate bash --shims)" # 将激活的工具添加到 $PATH

swiftlint {args}
```
