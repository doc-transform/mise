# 缓存行为

mise 在许多地方使用缓存以提高效率。缓存保留时长的细节最终都应该可以配置。当前行为中可能还有硬编码的地方，但我很乐意添加更多设置来满足各种配置需求。

下面解释 mise 的缓存行为。如果你发现某些东西似乎没有更新，这里是排查的好起点。

## 插件/运行时缓存

每个插件都有一个缓存，存储在 `~/$MISE_CACHE_DIR/<PLUGIN>` 中。它存储了该插件的可用版本列表（`mise ls-remote <PLUGIN>`）、惯用文件名（见下文）、别名列表、每个运行时安装目录中的 bin 目录，以及运行时安装后运行 `exec-env` 的结果。

远程版本列表默认每天更新一次。文件使用 zlib 压缩的 messagepack 格式，如果你想查看内容，可以运行以下命令（需要 [msgpack-cli](https://github.com/msgpack/msgpack-cli)）：

```sh
cat ~/$MISE_CACHE_DIR/node/remote_versions.msgpack.z | perl -e 'use Compress::Raw::Zlib;my $d=new Compress::Raw::Zlib::Inflate();my $o;undef $/;$d->inflate(<>,$o);print $o;' | msgpack-cli decode
```

请注意，如果 `exec-env` 脚本不是简单地导出静态值，缓存 `exec-env` 可能会有问题。绝大多数 `exec-env` 脚本只导出静态值。

缓存 `exec-env` 极大地提升了 mise 的性能，因为每次初始化 mise 都需要调用 bash。

## 环境缓存

对于更高级的缓存需求（包括密钥管理器等动态环境提供者），mise 提供了 [`env_cache`](/configuration/settings.html#env_cache) 设置。启用后，mise 会将计算出的环境加密缓存到磁盘。

```toml
# ~/.config/mise/config.toml
[settings]
env_cache = true
env_cache_ttl = "1h"  # 可选，默认 1h
```

缓存会在以下情况自动失效：

- 任何配置文件发生变更（mise.toml、.tool-versions 等）
- 工具版本变更
- 设置变更
- mise 版本变更
- TTL 过期（可通过 `env_cache_ttl` 配置）
- 任何被监视的文件发生变更（来自模块或 `_.source` 指令）

环境插件（vfox 模块）可以通过在 `MiseEnv` 钩子中返回 `{cacheable = true, watch_files = [...]}` 来声明自身可缓存。详见[环境插件开发](/env-plugin-development.html)。

指令可以通过设置 `cacheable = false` 来退出缓存：

```toml
[env]
TIMESTAMP = { value = "{{ now() }}", cacheable = false }
_.source = { file = "dynamic.sh", cacheable = false }
```

## 缓存自动清理

mise 会自动删除缓存目录中的旧文件（通过 [`cache_prune_age`](https://mise.jdx.dev/configuration/settings.html#cache_prune_age) 配置）。许多缓存内容在超过 24 小时或几天后也会被 mise 忽略。因此，在 CI 作业中存储此目录可能是浪费的。
