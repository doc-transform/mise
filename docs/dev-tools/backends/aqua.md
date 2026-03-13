# Aqua 工具源

[Aqua](https://aquaproj.github.io/) 工具可以在 mise 中原生使用。aqua 是添加新工具时的理想工具源，因为它不需要插件、支持 Windows、除校验和外还提供额外的安全功能。此外，aqua 安装过程会显示更多进度条，体验更好。

你不需要单独安装 aqua。mise 完全不使用 aqua CLI。实际使用的是 [aqua 注册表](https://github.com/aquaproj/aqua-registry)，这是一系列 YAML 文件，在发布时被编译到 mise 二进制文件中。
这里有一个示例文件：[`aqua:hashicorp/terraform`](https://github.com/aquaproj/aqua-registry/blob/main/pkgs/hashicorp/terraform/registry.yaml)。
mise 内置了 aqua 的重新实现，能够读取这些文件来安装工具。

截至撰写时，aqua 在 mise 中还比较新，由于许多工具正在从 asdf 转换到 aqua，某些 aqua 工具的配置可能还需要完善。下面列出了一些常见问题，我强烈建议发现问题时向 aqua 注册表贡献修复。维护者非常积极响应，合作起来很愉快。

如果实在不行，你可以通过 [`MISE_DISABLE_BACKENDS=aqua`](/configuration/settings.html#disable_backends) 完全禁用 aqua。

目前 aqua 工具不支持设置环境变量或执行下载二进制文件以外的操作（我也不确定这些功能是否会被添加），因此某些工具可能始终需要 asdf/vfox 插件。

相关代码位于 mise 仓库的 [`./src/backend/aqua.rs`](https://github.com/jdx/mise/blob/main/src/backend/aqua.rs)。

## 用法

以下命令安装最新版本的 ripgrep 并将其设为 PATH 中的活跃版本：

```sh
$ mise use -g aqua:BurntSushi/ripgrep
$ rg --version
ripgrep 14.1.1
```

版本将以如下格式写入 `~/.config/mise/config.toml`：

```toml
[tools]
"aqua:BurntSushi/ripgrep" = "latest"
```

部分工具如果在 [registry/](https://github.com/jdx/mise/blob/main/registry/) 中指定了使用 aqua 工具源，会默认使用 aqua。要查看这些工具，请运行 `mise registry | grep aqua:`。

## 工具选项

### `symlink_bins`

某些工具会捆绑一些你可能不想暴露在 PATH 中的依赖。例如，`aws-cli` 捆绑了 Python，可能会与你预期的 Python 版本冲突。

设置 `symlink_bins = true` 会创建一个经过过滤的 bin 目录，其中只包含指向 aqua 注册表中明确定义的二进制文件的符号链接，从而防止捆绑的依赖被暴露。

```toml
[tools]
aws-cli = { version = "latest", symlink_bins = true }
```

启用后：

- 只有 aqua 注册表 `files` 字段中定义的二进制文件会被暴露（例如 aws-cli 的 `aws` 和 `aws_completer`）
- 会创建一个 `.mise-bins` 子目录，其中包含指向这些特定二进制文件的符号链接
- Python 等捆绑的依赖不会被添加到 PATH

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="aqua" :level="3" />

## 安全验证

Aqua 工具源支持多种安全验证方式，确保下载工具的完整性和真实性。mise 为所有验证方式提供**原生 Rust 实现**，无需安装 `cosign`、`slsa-verifier` 或 `gh` 等外部 CLI 工具。

### GitHub Artifact Attestations

GitHub Artifact Attestations 提供加密证明，证明构件是由特定的 GitHub Actions 工作流构建的。mise 原生验证这些证明，确保下载工具的真实性和完整性。

**要求：**

- 工具必须在 aqua 注册表中配置了 `github_artifact_attestations` 才会进行验证
- 无需外部工具——验证由 mise 原生处理

**配置：**

```bash
# 启用/禁用 GitHub attestations 验证（默认：true）
export MISE_AQUA_GITHUB_ATTESTATIONS=true
```

**注册表配置示例：**

```yaml
packages:
  - type: github_release
    repo_owner: cli
    repo_name: cli
    github_artifact_attestations:
      signer_workflow: cli/cli/.github/workflows/deployment.yml
```

### Cosign 验证

mise 原生验证 Cosign 签名，无需安装 `cosign` CLI 工具。

**配置：**

```bash
# 启用/禁用 Cosign 验证（默认：true）
export MISE_AQUA_COSIGN=true

# 传递额外参数给验证过程
export MISE_AQUA_COSIGN_EXTRA_ARGS="--key /path/to/key.pub"
```

### SLSA 来源验证

mise 原生验证 SLSA（Supply-chain Levels for Software Artifacts，软件构件供应链安全等级）来源信息，无需安装 `slsa-verifier` CLI 工具。

**配置：**

```bash
# 启用/禁用 SLSA 验证（默认：true）
export MISE_AQUA_SLSA=true
```

### 其他安全方式

Aqua 还支持：

- **Minisign 验证**：使用 minisign 进行签名验证
- **校验和验证**：验证 SHA256/SHA512/SHA1/MD5 校验和（始终启用）

### 验证流程

在工具安装过程中，mise 会：

1. 下载工具以及所有签名/证明文件
2. 使用已配置的方式进行原生验证
3. 显示带进度指示的验证状态
4. 如果任何验证失败则中止安装

**安装过程中的输出示例：**

```
✓ Downloaded cli/cli v2.50.0
✓ GitHub attestations verified
✓ Tool installed successfully
```

### 故障排查

如果验证失败：

1. **检查网络连接**：验证需要下载证明数据
2. **检查工具配置**：确保 aqua 注册表中有正确的验证设置
3. **禁用特定验证**：临时禁用有问题的验证方式
4. **启用调试日志**：使用 `MISE_DEBUG=1` 查看详细的验证日志

**常见问题：**

- **未找到 attestations**：该工具可能在注册表中未配置 attestations
- **验证超时**：网络问题或 attestation 服务响应缓慢
- **证书验证失败**：时钟偏差或证书链问题

临时禁用所有验证：

```bash
export MISE_AQUA_GITHUB_ATTESTATIONS=false
export MISE_AQUA_COSIGN=false
export MISE_AQUA_SLSA=false
export MISE_AQUA_MINISIGN=false
```

## 常见 aqua 问题

以下是使用 aqua 工具时遇到的一些常见问题。

### supported env 缺失

aqua 注册表为每个工具定义了支持的操作系统/架构环境。我注意到有些工具的 os/arch 组合实际上是支持的，却没有列出——可能是因为它们是在注册表创建之后才添加的。

修复很简单，只需编辑对应工具 `registry.yaml` 的 `supported_envs` 部分即可。

### 使用 `version_filter` 而非 `version_prefix`

这是一个比较奇怪的问题，会在 mise 中引发异常行为。通常在 mise 中我们希望版本号是简洁的 `1.2.3` 格式，不带 `v1.2.3` 或 `cli-v1.2.3` 这样的修饰。这种一致性不仅让 `mise.toml` 更整洁，还能帮助 `mise up` 等命令正确工作，因为它能直接将版本号解析为 semver，而不必处理各种边界情况。

如果你发现 aqua 工具给出的版本号不是简单的三段式格式，就值得去修复。

一个常见的情况是注册表使用了类似 `Version startsWith "atlascli/"` 这样的 `version_filter` 表达式。

这最终导致版本号变成 `atlascli/1.2.3`，这不是我们想要的。修复方法是使用 `version_prefix` 代替 `version_filter`，只需将前缀放入 `version_prefix` 字段即可。在本例中就是 `atlascli/`。mise 会自动去除并重新添加这个前缀，而 `version_filter` 无法做到这一点。
