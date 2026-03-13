# 关于

`mise`（发音为 "meez"）或 "mise-en-place" 是一个开发环境配置工具。
这个名字来源于法语烹饪术语，大致意思是"准备就绪"或"各就各位"。
其理念是，在开始烹饪之前，厨师应该将所有器具和食材准备好并放在合适的位置。

`mise` 对你的项目做的事情也是一样。通过 `mise.toml` 配置文件，
无论你的项目使用什么编程语言，你都能以统一的方式来配置和管理项目。

它的功能分为以下三大类。

`mise` 负责安装和管理开发工具/运行时（如 node、python 或 terraform），既简化了这些工具的安装过程，又允许你为不同项目指定不同的工具版本。`mise` 支持[数百种](/plugins.md)开发工具。

`mise` 负责管理环境变量，让你可以为不同项目指定 `AWS_ACCESS_KEY_ID` 等配置。它还可以在进入项目时自动激活 [Python 虚拟环境](/lang/python)。

`mise` 还是一个任务运行器，可用于在项目中与开发者共享常用任务，轻松实现文件变更时自动运行任务等功能。

## 联系方式

`mise` 最初由 [Jeff Dickey](https://jdx.dev) 创建。其目标是让本地软件开发变得简单，并在各种编程语言之间保持一致。Jeff 多年来一直在构建开发工具，深入思考 `mise` 所解决的问题。

这个项目完全出于热爱。Jeff 创建它是因为他想让开发者的工作变得更轻松。希望你觉得它有用。反馈是我们最大的驱动力。如果你有任何正面或负面的想法——哪怕只是打个招呼——请随时通过 [Twitter](https://twitter.com/jdxcode)、[Mastodon](https://fosstodon.org/@jdx)、[Discord](https://discord.gg/UBa7pJUN7Z) 或 `jdx at this domain` 联系我们。
