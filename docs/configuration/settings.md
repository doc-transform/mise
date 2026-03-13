# 设置项

<script setup>
import Settings from '/components/settings.vue';
</script>

以下是 mise 所有设置项的列表。这些设置可以通过 `mise settings key=value` 命令设置，也可以直接修改 `~/.config/mise/config.toml` 或本地配置文件，或通过环境变量设置。

其中一些也可以通过全局 CLI 参数来设置。

<Settings :level="2" />
