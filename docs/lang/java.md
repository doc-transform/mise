# Java

与 `sdkman` 类似，`mise` 可以在同一系统上管理多个版本的 Java。

> 以下是使用 java mise 核心插件的说明。当没有安装名为 "java" 的 git 插件时会使用核心插件。如果你想使用 [asdf-java](https://github.com/halcyon/asdf-java)，请使用 `mise plugins install java GIT_URL`。

相关代码位于 mise 仓库的
[`./src/plugins/core/java.rs`](https://github.com/jdx/mise/blob/main/src/plugins/core/java.rs)。

## 用法

以下命令安装最新版本的 openjdk-21.x（如果尚未安装 openjdk-21.x 的某个版本）并将其设为全局默认版本：

```sh
mise use -g java@openjdk-21
mise use -g java@21         # openjdk 的替代简写
```

你也可以从不同的供应商安装 JDK。要获取某个供应商的最新版本，只需使用供应商前缀即可。

```sh
mise use -g java@temurin        # Temurin 的最新版本
mise use -g java@temurin-21
mise use -g java@zulu-21
mise use -g java@corretto-21
```

使用 `mise ls-remote java` 查看可用版本。

::: warning
注意简写版本（如示例中的 `21`）默认使用 [`OpenJDK`](https://openjdk.org/) 作为供应商。默认供应商可以通过设置 [`java.shorthand_vendor`](../configuration/settings.md#java.shorthand_vendor) 来更改。OpenJDK 版本只会更新 6 个月。在此短暂时期后将不再提供更新和安全补丁。LTS 版本也是如此。

关于如何选择 JDK 的更多信息，请参阅 <https://whichjdk.com>。
:::

## macOS JAVA_HOME 集成

macOS 上的某些应用依赖 `/usr/libexec/java_home` 来查找已安装的 Java 运行时。

要将已安装的 Java 运行时与 macOS 集成，请为相应版本（如 openjdk-21）运行以下命令：

```sh
sudo mkdir /Library/Java/JavaVirtualMachines/openjdk-21.jdk
sudo ln -s ~/.local/share/mise/installs/java/openjdk-21/Contents /Library/Java/JavaVirtualMachines/openjdk-21.jdk/Contents
```

> 注意：并非所有 Java SDK 发行版都支持此集成（如 liberica）。

## `.java-version` 和 `.sdkmanrc` 文件支持

Java 核心插件支持 `.java-version` 和 `.sdkmanrc` 惯用版本文件。参阅[惯用版本文件](/configuration.html#idiomatic-version-files)。

对于 `.sdkmanrc` 文件，mise 会尝试将供应商和版本映射到相应的版本字符串。例如，版本 `20.0.2-tem` 会被映射为 `temurin-20.0.2`。由于 Azul 的 Zulu 版本体系不同，版本 `11.0.12-zulu` 会被映射为主版本 `zulu-11`。

并非 [sdkman](https://sdkman.io/jdks) 中所有可用的供应商都受 mise 支持。
以下供应商**不受**支持：`bsg`（Bisheng）、`graal`（GraalVM）、`nik`（Liberica NIK）。

### 使用不受支持的版本

如果需要不受支持的 java 版本，需要一些手动操作：

1. 将不受支持的版本下载到一个目录（如 `~/.sdkman/candidates/java/21.0.1-open`）
2. 创建新版本的符号链接：

```sh
ln -s ~/.sdkman/candidates/java/21.0.1-open ~/.local/share/mise/installs/java/21.0.1-open
```

3. 如果是 Mac：

```sh
mkdir ~/.local/share/mise/installs/java/21.0.1-open/Contents
mkdir ~/.local/share/mise/installs/java/21.0.1-open/Contents/MacOS

ln -s ~/.sdkman/candidates/java/21.0.1-open ~/.local/share/mise/installs/java/21.0.1-open/Contents/Home
cp ~/.local/share/mise/installs/java/21.0.1-open/lib/libjli.dylib ~/.local/share/mise/installs/java/21.0.1-open/Contents/MacOS/libjli.dylib
```

4. 别忘了确保缓存被阻止且有效，确保在 [mise 缓存](https://mise.jdx.dev/directories.html#cache-mise)中为你的版本创建一个**空**目录：
   例如

```sh
$ ls -R $MISE_CACHE_DIR/java
21.0.1-open

mise/java/21.0.1-open:
```

## 工具选项

以下[工具选项](/dev-tools/#tool-options)可用于 `java` 工具源，
在 `mise.toml` 的 `[tools]` 中配置。

### `release_type`

`release_type` 选项允许你指定要安装的发布类型。支持以下值：

- `ga`（默认）：正式发布版本（General Availability）
- `ea`：早期访问版本（Early Access）

```toml
[tools]
"java" = { version = "openjdk-21", release_type = "ea" }
```

## Gradle 工具链检测

Gradle 可以自动检测某些工具安装的工具链（参阅 [toolchain | auto-detection](https://docs.gradle.org/current/userguide/toolchains.html#sec:auto_detection)）。

目前，`Gradle` 不支持自动检测 `mise` 安装的 Java（参阅 [gradle/issues/29508](https://github.com/gradle/gradle/issues/29508) 和 [gradle/issues/29355](https://github.com/gradle/gradle/issues/29355)）。一个变通方法是利用 `mise` 的安装布局[与 `asdf` 使用的布局相似](/ide-integration.html#sdk-selection-using-asdf-layout)这一特点。

```shell
mkdir -p ~/.asdf/installs/ && ln -s ~/.local/share/mise/installs/java ~/.asdf/installs/
```

或者，你也可以使用 [foojay-resolver-convention](https://plugins.gradle.org/plugin/org.gradle.toolchains.foojay-resolver-convention) 插件让 Gradle 自动安装项目所需的 JDK。
