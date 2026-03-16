# Mise + Docker 实践手册

以下是在 Docker 中使用 mise 的一些技巧。

## 包含 mise 的 Docker 镜像

以下是一个示例 Dockerfile，展示如何在 Docker 镜像中安装 mise。

```Dockerfile [Dockerfile]
FROM debian:12-slim

RUN apt-get update  \
    && apt-get -y --no-install-recommends install  \
        # 安装你可能需要的其他依赖
        sudo curl git ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"
# ENV MISE_VERSION="..."

RUN curl https://mise.run | sh
```

构建并运行 Docker 镜像：

```shell
docker build -t debian-mise .
docker run -it --rm debian-mise
```

## 多用户容器中的共享工具

对于工具箱容器或堡垒机等需要为所有用户预装工具的场景，可以使用 `mise install --system` 将工具安装到 `/usr/local/share/mise/installs`。每个用户的 mise 会自动发现这些系统级工具，无需额外配置。

```Dockerfile [Dockerfile]
FROM debian:13-slim

RUN apt-get update  \
    && apt-get -y --no-install-recommends install  \
        sudo curl git ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"

# Install mise
RUN curl https://mise.run | sh

# Pre-install tools to the system-wide shared directory
RUN mise install --system node@22 python@3.13
```

容器内的用户会自动看到这些工具：

```shell
$ mise ls
node    22.0.0 (system)
python  3.13.0 (system)
```

用户可以在自己的目录中安装额外的版本——个人安装的版本优先于系统版本。要自定义系统目录，请设置 `MISE_SYSTEM_DATA_DIR`。

你也可以通过 `MISE_SHARED_INSTALL_DIRS`（以冒号分隔的路径列表）或 `shared_install_dirs` 设置项来配置额外的共享目录。

### 挂载 home 目录的 Devcontainer

Devcontainer 通常会挂载用户的 home 目录，这意味着 `~/.local/share/mise/installs` 来自挂载卷而非 Docker 镜像。在 `docker build` 阶段预装到 `~/.local/share/mise/installs` 的工具会被挂载覆盖。

使用 `mise install --system` 将工具安装到 `/usr/local/share/mise/installs`——这个路径在 `~` 之外，不会受 home 目录挂载的影响：

```Dockerfile [Dockerfile]
FROM debian:13-slim
# ... install mise ...
RUN mise install --system node@22 python@3.13
```

当容器以挂载 `~` 的方式启动时，用户仍然可以自动使用系统工具。用户正常安装的工具会放在 `~/.local/share/mise/installs`（挂载卷上），并优先于系统版本。

## 在 Docker 容器中运行 mise 的任务

当你需要在干净的环境中复现 mise 的问题时，这个方法很有用。

```toml [mise.toml]
[tasks.docker]
run = "docker run --pull=always -it --rm --entrypoint bash jdxcode/mise:latest"
```

使用示例：

```shell
❯ mise docker
[docker] $ docker run --pull=always -it --rm --entrypoint bash jdxcode/mise:latest
# latest: Pulling from jdxcode/mise
# Digest: sha256:eecc479b6259479ffca5a4f9c68dbfe8631ca62dc59aa60c9ab5e4f6e9982701
# Status: Image is up to date for jdxcode/mise:latest
root@75f179a190a1:/mise# eval "$(mise activate bash)"
# 覆盖配置并清理以获得干净的状态
root@75f179a190a1:/mise# echo "" >/mise/config.toml
root@75f179a190a1:/mise# mise prune --yes
# mise pruned configuration links
# mise python@3.13.1 ✓ remove /mise/cache/python/3.13.1
# ...
```
