<script setup>
import { VPTeamPage, VPTeamPageTitle, VPTeamPageSection, VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/jdx.png',
    name: 'Jeff Dickey',
    title: 'BDFL',
    links: [
      { icon: 'github', link: 'https://github.com/jdx' },
      { icon: 'twitter', link: 'https://twitter.com/jdxcode' },
      { icon: 'mastodon', link: 'https://fosstodon.org/@jdx' }
    ]
  }
]
const board = [
  {
    avatar: 'https://www.github.com/booniepepper.png',
    name: 'Justin "J.R." Hill',
    links: [
      { icon: 'github', link: 'https://github.com/booniepepper' },
    ]
  },
  {
    avatar: 'https://www.github.com/pepicrft.png',
    name: 'Pedro Piñera Buendía',
    links: [
      { icon: 'github', link: 'https://github.com/pepicrft' },
    ]
  },
  {
    avatar: 'https://www.github.com/chadac.png',
    name: 'Chad Crawford',
    links: [
      { icon: 'github', link: 'https://github.com/chadac' },
    ]
  }
]
</script>

# 团队

Jeff Dickey 是 mise 背后的主要开发者。他承担了项目的绝大部分开发工作。

<VPTeamMembers :members="members" />

## 顾问委员会

顾问委员会帮助做出项目的重要决策，例如：

- 路线图上应该有哪些功能
- 功能何时应该从实验性状态转为稳定
- 功能是否/何时/如何被废弃

<VPTeamMembers :members="board" />

## 贡献者

mise 是一个开源项目，欢迎[贡献](https://github.com/jdx/mise/graphs/contributors)。我们感谢那些为项目贡献了自己工作的人们。
