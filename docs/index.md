---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: Home

hero:
  name: mise-en-place
  tagline: |
    一站式开发环境管理工具
    <span class="formerly">发音 "MEEZ ahn plahs"</span>
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started
    - theme: alt
      text: 演示
      link: /demo
    - theme: alt
      text: 关于
      link: /about

features:
  - title: 开发工具
    link: /dev-tools/
    icon: 🛠️
    details: mise 是一个跨语言的工具版本管理器，可替代 asdf、nvm、pyenv、rbenv 等工具。
  - title: 环境变量
    details: mise 允许你在不同项目目录中切换环境变量集合，可替代 direnv。
    icon: ⚙
    link: /environments/
  - title: 任务运行器
    link: /tasks/
    details: mise 内置任务运行器，可替代 make 或 npm scripts。
    icon: ⚡
---

<style>
.formerly {
    font-size: 0.7em;
    color: #666;
}
</style>
