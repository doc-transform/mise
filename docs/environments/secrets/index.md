# 密钥管理

使用 mise 安全地管理敏感环境变量。支持多种方式：

- **[fnox](https://github.com/jdx/fnox)** <Badge type="tip" text="recommended" /> — 功能完整的密钥管理器，支持远程密钥存储（如 1Password、AWS Secrets Manager）和远程加密（如 AWS KMS）。这是 @jdx 维护的独立项目，与 mise 配合使用效果很好。fnox 与 mise 之间没有直接集成，需要单独设置。
- [sops](/environments/secrets/sops) <Badge type="warning" text="experimental" /> — 加密整个文件，通过 `env._.file` 加载
- [age 直接加密](/environments/secrets/age) <Badge type="warning" text="experimental" /> — 在 `mise.toml` 中内联加密单个环境变量
