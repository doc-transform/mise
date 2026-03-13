# 从 rtx 迁移

`mise` 以前叫 `rtx`。更名是为了避免与 Nvidia 的显卡系列产品混淆。这不是法律问题，只是容易引起误解。当人们第一次听说这个项目或看到相关帖子时，不会意识到说的是一个 CLI 工具。在 Google 上搜索有点困难，在 Twitter、Slack 搜索等场景也是如此。这是关于 `rtx` 最多的投诉，许多人对这个名字相当直言不讳地表示不满。`rtx` 本来只是一个工作名称，我打算以后改的，但一直没来得及。这个更改本应更早进行，在用户更少的时候，我为没有更早做这件事而道歉，因为我知道这迟早是必要的。

要从 `rtx` 升级到 `mise`，只需安装 `mise`，它会自动迁移其内部目录，将 `~/.local/share/rtx/installs/*` 移动到 `~/.local/share/mise/installs/*`（跳过无法移动的 Python 和 Ruby），将 `~/.local/share/rtx/plugins` 移动到 `~/.local/share/mise/plugins`，将 `~/.config/rtx` 移动到 `~/.config/mise`（如果目标不存在的话）。Python 和 Ruby 的安装需要使用 `mise install` 重新安装。

`mise` 会在一段时间内继续读取 `.rtx.toml` 文件，但最终会被弃用，请将它们重命名为 `mise.toml`。`mise` 不会读取 `RTX_*` 环境变量，因此这些需要改为 `MISE_*`。任何使用本地 `.rtx` 或 `.config/rtx` 目录的内容都需要移动到 `.mise`/`.config/mise`。

如果迁移过程不够平滑，我深表歉意，但我认为迁移到一个更容易搜索且避免混淆的名字对所有人都更好。对于过程的突然我也表示抱歉——我实在想不出什么方式可以在保留 GitHub 仓库的同时"渐进式"地推出这个变更。

使用 `rtx-action` GitHub action 的用户需要切换到 `mise-action`（同时也需要将主版本号升级到 v2）。

如果你管理的基础设施中用户可能仍在 shell rc 脚本中调用 `rtx activate`，你可以创建符号链接 `ln -s /path/to/mise /path/to/rtx`，这样 `rtx activate` 仍然能正常工作。

对于 <https://mise.run>，我们使用 `~/.local/bin/mise` 作为可执行文件路径，而不是旧的目录 `~/.local/share/rtx/bin/mise`，以保持路径更简洁。如果你喜欢旧的方式，可以通过设置 `MISE_INSTALL_PATH` 来使用。

如果你使用 shims，需要运行 `mise reshim` 来更新 shims。

顺便说一下，感谢你尝试我的这个小 CLI 工具。我觉得做这个项目非常有成就感，也很高兴看到人们用它取得成功。我对构建开发工具有极大的热情，`mise` 中的理念是我十多年来思考的产物。

如果你对 `mise` 或我运作这个项目的方式有任何不满，哪怕只是一点点，请告诉我。如果你愿意，可以[私下联系我](/about#contact)。我绝不会在意，相比什么都不说，我更希望你能提出来。否则我永远也不会知道。
