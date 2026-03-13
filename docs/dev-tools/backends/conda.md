# Conda 工具源 <Badge type="warning" text="experimental" />

你可以直接从 [conda-forge](https://conda-forge.org/) 和其他 Anaconda 频道安装包，无需安装 conda 或 mamba。

此工具源从 anaconda.org API 获取预构建的包并直接解压，是一种轻量级的方式来安装 conda 包作为独立的 CLI 工具。

相关代码位于 mise 仓库的 [`./src/backend/conda.rs`](https://github.com/jdx/mise/blob/main/src/backend/conda.rs)。

## 依赖

无。与其他 conda 工具不同，此工具源不需要安装 conda、mamba 或 micromamba。它直接从 anaconda.org 下载并解压包。

## 用法

以下命令安装最新版本的 [ruff](https://anaconda.org/conda-forge/ruff) 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g conda:ruff
$ ruff --version
ruff 0.8.0
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"conda:ruff" = "latest"
```

### 指定版本

```sh
mise use -g conda:ruff@0.7.0
```

### 使用不同的频道

默认从 `conda-forge` 安装包。你可以指定不同的频道：

```sh
mise use -g "conda:ruff[channel=bioconda]"
```

或者在 `mise.toml` 中：

```toml
[tools]
"conda:ruff" = { version = "latest", channel = "bioconda" }
```

## 平台支持

conda 工具源会自动为你的平台选择合适的包：

| 平台        | Conda 子目录    |
| ----------- | --------------- |
| Linux x64   | linux-64        |
| Linux ARM64 | linux-aarch64   |
| macOS x64   | osx-64          |
| macOS ARM64 | osx-arm64       |
| Windows x64 | win-64          |

如果特定平台的包不可用，工具源会回退到 `noarch` 包。

## 设置

通过 `mise settings set [VARIABLE] [VALUE]` 或设置对应的环境变量进行配置。

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="conda" :level="3" />

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `conda` 工具源——在 `mise.toml` 的 `[tools]` 中配置。

### `channel`

为特定包指定 conda 频道：

```toml
[tools]
"conda:bioconductor-deseq2" = { version = "latest", channel = "bioconda" }
```

## 常用频道

- `conda-forge` - 社区维护的包（默认）
- `bioconda` - 生物信息学包
- `nvidia` - NVIDIA CUDA 包

## 局限性

- 只能安装单个包，不能安装包含依赖的完整 conda 环境
- 最适合不需要复杂依赖树的独立 CLI 工具
- 不能像完整的 conda/mamba 那样管理 Python 环境或包依赖
