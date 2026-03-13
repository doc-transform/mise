# Swift <Badge type="warning" text="experimental" />

`mise` 可用于在同一系统上管理多个版本的 [`swift`](https://swift.org/)。Swift 支持 macOS 和 Linux。

## 用法

使用最新稳定版 swift：

```sh
mise use -g swift
swift --version
```

关于如何将 `mise` 与 `swift` 配合使用，请参阅 [Swift 开发者的 mise 指南](https://tuist.dev/blog/2025/02/04/mise)。

## 设置

<script setup>
import Settings from '/components/settings.vue';
</script>
<Settings child="swift" :level="3" />
