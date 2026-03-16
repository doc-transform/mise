---
name: "同步上游并增量翻译"
description: "从 upstream (jdx/mise) 拉取最新 main 分支，合并到本地 main，再合并到 transform 分支，并对冲突和新增的英文内容进行高质量中文翻译"
---

# 同步上游并增量翻译

## 概述

本项目是 [jdx/mise](https://github.com/jdx/mise) 的 fork，`transform` 分支用于维护中文翻译版文档。此 Skill 的职责是：

1. 从 upstream 拉取最新的 `main` 分支代码
2. 将 upstream/main 合并到本地 `main` 分支
3. 将本地 `main` 合并到 `transform` 分支
4. 处理合并冲突，对新增/变更的英文内容进行**高质量增量翻译**

## 执行步骤

### 第一步：同步 upstream 到本地 main

```
1. 确认 upstream remote 存在（upstream -> https://github.com/jdx/mise.git）
2. 切换到 main 分支
3. 执行 git fetch upstream
4. 执行 git merge upstream/main（main 分支是纯英文，不应有冲突）
5. 推送更新后的 main 到 origin
```

具体命令：

```sh
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 第二步：将 main 合并到 transform 分支

```
1. 切换到 transform 分支
2. 执行 git merge main
3. 此时可能会产生冲突——因为 transform 分支将英文翻译为了中文
```

具体命令：

```sh
git checkout transform
git merge main
```

### 第三步：处理冲突并增量翻译

合并后会出现以下几种情况，需要分别处理：

#### 情况 A：无冲突的新文件

upstream 新增的文件会自动合并进来，这些文件是全英文的，需要**整篇翻译**。

**处理方式**：

- 使用 `git diff main..transform --name-only --diff-filter=A` 找出新增但未翻译的文件（对比内容是否为英文）
- 对这些文件执行完整翻译

#### 情况 B：有冲突的文件

upstream 修改了某些已翻译文件的内容，导致合并冲突。

**处理方式**：

1. 使用 `git diff --name-only --diff-filter=U` 查看冲突文件列表
2. 对每个冲突文件：
   - 查看冲突标记（`<<<<<<<`、`=======`、`>>>>>>>`）
   - `<<<<<<< HEAD` 到 `=======` 之间是 **transform 分支的中文翻译内容**
   - `=======` 到 `>>>>>>> main` 之间是 **upstream 最新的英文内容**
   - 需要理解 upstream 的改动意图，将新内容翻译为中文，与已有翻译融合
   - 解决冲突后删除所有冲突标记

#### 情况 C：无冲突但内容变更的文件

upstream 修改了一些 transform 分支未触及的区域（如代码块、配置等），这些会自动合并，但可能引入新的英文内容。

**处理方式**：

- 使用 `git diff HEAD~1..HEAD --name-only` 查看本次合并变更的文件
- 检查这些文件中是否有新引入的英文段落需要翻译

### 第四步：提交翻译结果

```sh
git add .
git commit -m "docs: 同步上游更新并增量翻译"
git push origin transform
```

## 翻译规范（极其重要）

这是 **mise 开发工具** 的技术文档翻译，必须遵循以下规范：

### 1. 翻译质量要求

- **准确性**：技术术语必须准确，不能望文生义
- **可读性**：翻译后的中文要自然流畅，符合中文技术文档的表达习惯
- **一致性**：同一术语在整个项目中保持统一翻译

### 2. 术语对照表

以下术语有固定翻译，必须严格遵守：

| 英文                 | 中文                | 说明              |
| -------------------- | ------------------- | ----------------- |
| tool                 | 工具                |                   |
| backend              | 工具源              | mise 的后端安装源 |
| plugin               | 插件                |                   |
| task                 | 任务                |                   |
| environment variable | 环境变量            |                   |
| shim                 | Shim                | 保留英文不翻译    |
| registry             | 注册表 / 工具注册表 |                   |
| hook                 | 钩子                |                   |
| lockfile / mise.lock | 锁文件              |                   |
| configuration        | 配置                |                   |
| settings             | 设置项              |                   |
| alias                | 别名                |                   |
| core tools           | 核心工具            |                   |
| dev tools            | 开发工具            |                   |
| secret               | 密钥                |                   |
| template             | 模板                |                   |
| walkthrough          | 使用教程            |                   |
| getting started      | 快速开始            |                   |
| troubleshooting      | 故障排查            |                   |
| FAQ                  | 常见问题            |                   |
| cookbook             | 实用示例            |                   |
| prepare              | 预安装              | mise prepare 命令 |
| tool stub            | 工具桩              |                   |
| shell alias          | Shell 别名          |                   |
| monorepo             | Monorepo            | 保留英文          |

### 3. 不翻译的内容

以下内容**绝对不能翻译**，保持原样：

- **代码块**（\`\`\` 包裹的内容）：所有命令、代码、配置文件内容保持原样
- **行内代码**（\` 包裹的内容）：如 `mise use`、`node@22`、`mise.toml`
- **文件路径**：如 `~/.local/bin/mise`、`~/.config/mise/`
- **URL 链接**：所有链接地址保持不变
- **命令名称**：如 `mise install`、`mise exec`、`mise run`
- **品牌/产品名**：如 `mise`、`Node.js`、`Python`、`Docker`、`GitHub`
- **Markdown 锚点 ID**：如 `{#mise-exec-run}` 保持不变
- **frontmatter**：YAML 头部元数据保持不变
- **HTML 标签和属性**
- **环境变量名**：如 `MISE_DATA_DIR`、`PATH`

### 4. 格式规范

- 中文与英文、数字之间加一个半角空格，例如：`mise 支持 100 多种工具`
- 中文标点使用全角：`，。！？：；（）`
- 英文标点在代码/命令上下文中保持半角
- 保持原文的 Markdown 格式结构（标题层级、列表、引用等）
- 保留原文的换行和段落结构
- 翻译后的 Vitepress 侧边栏导航文本参照 `docs/.vitepress/config.ts` 中已有翻译

### 5. 翻译风格

- 使用**正式但不生硬**的技术文档语气
- 第二人称使用"你"而非"您"
- 被动句尽量转换为主动句
- 避免直译导致的不自然表达，应意译使中文读者容易理解
- 示例：
  - ❌ "这个工具被设计来管理你的开发环境的版本"
  - ✅ "这个工具用于管理开发环境中的工具版本"

### 6. 特殊处理

- **注意/警告框**（如 `:::tip`、`:::warning`）：翻译框内文字，但保留 Markdown 语法标记
- **表格**：翻译表头和说明文字，保留代码和命令
- **图片 alt 文本**：翻译为中文
- **页面标题**（`# 标题`）：翻译为中文，确保与 `config.ts` 侧边栏一致

## 冲突解决策略

当遇到合并冲突时，遵循以下优先级：

1. **理解 upstream 改动的意图**：先看 upstream 改了什么，是新增内容、修改措辞、还是修复错误
2. **保留已有高质量翻译**：如果 transform 分支的翻译是正确的，upstream 只是小改措辞，保留翻译但根据新意图微调
3. **翻译新增内容**：upstream 新增的段落/章节，按翻译规范翻译为中文
4. **删除被 upstream 删除的内容**：如果 upstream 删除了某段内容，transform 分支也应删除对应翻译
5. **更新被 upstream 修改的内容**：如果 upstream 修改了技术细节（如命令参数变更），必须更新翻译以反映新的技术事实

## 验证清单

翻译完成后，检查以下项目：

- [ ] 所有冲突标记（`<<<<<<<`、`=======`、`>>>>>>>`）已清除
- [ ] 代码块内容未被错误翻译
- [ ] 行内代码、命令、路径未被翻译
- [ ] Markdown 链接正常，没有损坏
- [ ] 页面标题与 `config.ts` 侧边栏保持一致
- [ ] 没有残留的英文段落（除代码块外）
- [ ] 术语翻译与术语表一致
- [ ] 中英文之间有空格
- [ ] 文档可以通过 `vitepress dev` 正常预览
