# age 直接加密 <Badge type="warning" text="experimental" />

使用 [age](https://github.com/FiloSottile/age) 加密直接在 `mise.toml` 中加密单个环境变量值。无需安装 age 工具——mise 已内置支持。

这是一种将加密环境变量直接存储在 `mise.toml` 中的简单方法。你只需运行 `mise set --age-encrypt <key>=<value>` 即可。默认情况下，如果存在 SSH 密钥（`~/.ssh/id_ed25519` 或 `~/.ssh/id_rsa`），mise 会自动使用。

- **内联存储**：值与其他环境变量一起存储在 `mise.toml` 中
- **多接收者**：支持 x25519 age 密钥和 SSH 接收者
- **自动解密**：运行时当身份凭证可用时自动解密

## 快速开始

1. [可选] 生成 age 密钥（如果你想创建新的 age 密钥而不使用 SSH 密钥）：

```bash
age-keygen -o ~/.config/mise/age.txt
# 记下输出的公钥用于加密
```

2. 加密一个值：

```bash
mise set --age-encrypt --prompt DB_PASSWORD
# Enter value for DB_PASSWORD: [隐藏输入]
```

:::: warning
建议使用 `--prompt` 以避免将值暴露在 shell 历史记录中。当然你也可以直接使用 `mise set --age-encrypt DB_PASSWORD="password123"`。
::::

3. 值会以 age 指令的形式加密存储在 `mise.toml` 中：

```toml
[env]
DB_PASSWORD = { age = { value = "<base64>" } }
```

4. 解密自动完成：

```bash
mise env  # 变量自动解密
```

## CLI 选项

- `--age-encrypt` — 对值启用 age 加密
- `--age-recipient <KEY>` — x25519 接收者（可多次设置）
- `--age-ssh-recipient <PATH|KEY>` — SSH 公钥或 `.pub`/私钥文件路径（可多次设置）
- `--age-key-file <PATH>` — 使用从 age 身份文件派生的接收者
- `--prompt` — 提示输入值，避免暴露在 shell 历史记录中

如果未明确提供接收者，mise 会尝试使用默认值（见下文）。

## 存储格式

加密值以 base64 存储，并带有 `format` 字段：

- `format = "raw"` — 未压缩的密文（通常用于小值）
- `format = "zstd"` — zstd 压缩的密文（当密文 > 1KB 时使用）

## 解密身份凭证

mise 按以下顺序查找身份凭证：

1. `MISE_AGE_KEY` 环境变量
   - 可以包含一个或多个原始的 `AGE-SECRET-KEY-...` 行，或 age 身份文件内容
2. `settings.age.identity_files`（路径列表）
3. `settings.age.key_file`（单个路径）
4. 默认路径 `~/.config/mise/age.txt`（如果存在）
5. `settings.age.ssh_identity_files` 中的 SSH 身份凭证以及常见默认路径（`~/.ssh/id_ed25519`、`~/.ssh/id_rsa`）

解密后的值始终被标记为脱敏。

如果找不到身份凭证或解密失败，mise 会原样返回加密值（非严格模式）。

## 加密时的默认接收者

当使用 `--age-encrypt` 但未明确指定接收者时，mise 会尝试从以下来源派生接收者：

- 默认密钥文件 `~/.config/mise/age.txt` 中身份凭证对应的公钥
- 如果存在对应的 `.pub` 文件，则从 SSH 私钥推断出的公钥

如果都找不到，命令会报错并提示你提供接收者或配置 `settings.age.key_file`。

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="age" :level="2" />

## 注意事项

- 此功能为实验性功能；选项和行为可能会变化。
- `mise set KEY` 会打印解密后的值
