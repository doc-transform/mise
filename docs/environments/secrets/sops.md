# sops <Badge type="warning" text="experimental" />

mise 可以读取加密的密钥文件，并通过 `env._.file` 将值作为环境变量提供。

- **格式**：`.env.json`、`.env.yaml`、`.env.toml`
- **加密**：[sops](https://getsops.io)，基于 [age](https://github.com/FiloSottile/age)

## 示例

```json
{
  "AWS_ACCESS_KEY_ID": "AKIAIOSFODNN7EXAMPLE",
  "AWS_SECRET_ACCESS_KEY": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
}
```

```toml [mise.toml]
[env]
_.file = ".env.json"
```

如果文件是 sops 加密的，mise 会自动解密。

## 使用 sops 加密

::::: info
目前仅支持 age 作为 sops 加密方式。
:::::

1. 安装工具：`mise use -g sops age`

2. 生成 age 密钥并记下公钥：

```sh
age-keygen -o ~/.config/mise/age.txt
# Public key: <公钥>
```

3. 加密文件：

```sh
sops encrypt -i --age "<公钥>" .env.json
```

::::: tip
`-i` 会覆盖原文件。加密后的文件可以安全提交到版本控制。设置 `SOPS_AGE_KEY_FILE=~/.config/mise/age.txt` 或 `MISE_SOPS_AGE_KEY_FILE=~/.config/mise/age.txt` 以便使用 sops 解密/编辑。
:::::

4. 在配置中引用：

```toml
[env]
_.file = ".env.json"
```

现在 `mise env` 即可输出这些值。

## 环境变量

mise 同时支持 mise 特有的环境变量和标准 SOPS 环境变量：

**Mise 特有变量（最高优先级）：**

- `MISE_SOPS_AGE_KEY` - 直接提供 age 私钥内容
- `MISE_SOPS_AGE_KEY_FILE` - age 私钥文件路径

**标准 SOPS 变量（备选）：**

- `SOPS_AGE_KEY_FILE` - age 私钥文件路径
- `SOPS_AGE_KEY` - 直接提供 age 私钥内容

**优先级顺序：**

1. `MISE_SOPS_AGE_KEY`（mise 设置或环境变量，最先检查）
2. `MISE_SOPS_AGE_KEY_FILE` 或 `sops.age_key_file`（mise 设置或环境变量）
3. `SOPS_AGE_KEY_FILE`（标准）
4. `SOPS_AGE_KEY`（标准，直接提供密钥内容）
5. 默认值：`~/.config/mise/age.txt`

这允许你为 mise 单独覆盖 SOPS 设置，同时保持标准 SOPS 配置不受影响，以便其他工具使用。

## 脱敏处理

将文件中的密钥标记为敏感信息：

```toml
[env]
_.file = { path = ".env.json", redact = true }
```

处理脱敏的值：

```bash
mise env --redacted
mise env --redacted --values
```

### CI 脱敏（GitHub Actions）

```yaml
- name: Mask secrets
  run: |
    for value in $(mise env --redacted --values); do
      echo "::add-mask::$value"
    done
- name: Use secrets safely
  run: |
    mise exec -- ./deploy.sh
```

如果你使用 [mise-action](https://github.com/jdx/mise-action)，标记了 `redact = true` 的值会自动被脱敏。

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="sops" :level="2" />
