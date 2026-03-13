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
