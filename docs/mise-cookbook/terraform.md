# Mise + Terraform/Opentofu 实践手册

以下是使用 mise 管理 Terraform 项目的一些技巧。

## 管理 `terraform`/`opentofu` 项目

通常需要将 terraform 配置放在 `terraform/` 子目录中。这就需要使用类似 `terraform -chdir=terraform plan` 的语法来执行相应的 terraform 命令。以下配置允许你通过 `mise` 调用所有命令，利用 `mise` 任务来简化操作。

```toml [mise.toml]
[tools]
terraform = "1"

[tasks."terraform:init"]
description = "Initializes a Terraform working directory"
run = "terraform -chdir=terraform init"

[tasks."terraform:plan"]
description = "Generates an execution plan for Terraform"
run = "terraform -chdir=terraform plan"

[tasks."terraform:apply"]
description = "Applies the changes required to reach the desired state of the configuration"
run = "terraform -chdir=terraform apply"

[tasks."terraform:destroy"]
description = "Destroy Terraform-managed infrastructure"
run = "terraform -chdir=terraform destroy"

[tasks."terraform:validate"]
description = "Validates the Terraform files"
run = "terraform -chdir=terraform validate"

[tasks."terraform:format"]
description = "Formats the Terraform files"
run = "terraform -chdir=terraform fmt"

[tasks."terraform:check"]
description = "Checks the Terraform files"
depends = ["terraform:format", "terraform:validate"]

[env]
_.file = ".env"

```
