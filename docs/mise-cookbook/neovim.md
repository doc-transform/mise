# Mise + Neovim 实践手册

以下是改善 [Neovim](https://github.com/neovim/neovim) 中 mise 工作流的一些技巧。

## 语法高亮

### run 命令

使用 [Treesitter](https://github.com/nvim-treesitter/nvim-treesitter) 为 mise 文件中 run 命令的代码启用语法高亮。
请参阅下图左侧的示例：

![run cmd syntax highlighting demo](./run-cmd-syntax-hl.png)

在你的 neovim 配置中，创建 `after/queries/toml/injections.scm` 文件并写入以下查询：

```query
; extends

(pair
  (bare_key) @key (#eq? @key "run")
  (string) @injection.content @injection.language

  (#is-mise?)
  (#match? @injection.language "^['\"]{3}\n*#!(/\\w+)+/env\\s+\\w+") ; 使用 env 的多行 shebang
  (#gsub! @injection.language "^.*#!/.*/env%s+([^%s]+).*" "%1") ; 提取语言
  (#offset! @injection.content 0 3 0 -3) ; 移除引号
)

(pair
  (bare_key) @key (#eq? @key "run")
  (string) @injection.content @injection.language

  (#is-mise?)
  (#match? @injection.language "^['\"]{3}\n*#!(/\\w+)+\s*\n") ; 多行 shebang
  (#gsub! @injection.language "^.*#!/.*/([^/%s]+).*" "%1") ; 提取语言
  (#offset! @injection.content 0 3 0 -3) ; 移除引号
)

(pair
  (bare_key) @key (#eq? @key "run")
  (string) @injection.content

  (#is-mise?)
  (#match? @injection.content "^['\"]{3}\n*.*") ; 多行
  (#not-match? @injection.content "^['\"]{3}\n*#!") ; 无 shebang
  (#offset! @injection.content 0 3 0 -3) ; 移除引号
  (#set! injection.language "bash") ; 默认为 bash
)

(pair
  (bare_key) @key (#eq? @key "run")
  (string) @injection.content

  (#is-mise?)
  (#not-match? @injection.content "^['\"]{3}") ; 非多行
  (#offset! @injection.content 0 1 0 -1) ; 移除引号
  (#set! injection.language "bash") ; 默认为 bash
)
```

为了仅在 mise 文件上应用高亮而非所有 toml 文件，使用了 `is-mise?` 谓词。
如果你不需要这种区分，可以删除包含 `(#is-mise?)` 的行。
否则，确保在 neovim 配置中也创建该谓词。

例如，使用 [`lazy.nvim`](https://github.com/folke/lazy.nvim)：

```lua
{
  "nvim-treesitter/nvim-treesitter",
  init = function()
    require("vim.treesitter.query").add_predicate("is-mise?", function(_, _, bufnr, _)
      local filepath = vim.api.nvim_buf_get_name(tonumber(bufnr) or 0)
      local filename = vim.fn.fnamemodify(filepath, ":t")
      return string.match(filename, ".*mise.*%.toml$") ~= nil
    end, { force = true, all = false })
  end,
},
```

这会将文件名中包含 `mise` 的所有 `toml` 文件视为 mise 文件。

### 文件任务中的 MISE 和 USAGE 注释

你还可以使用 Treesitter 为基于文件的任务中的 `#MISE` 和 `#USAGE` 注释启用语法高亮。
请参阅下图左侧的示例：

![USAGE spec syntax highlighting demo](./usage-spec-syntax-hl.png)

在你的 neovim 配置中，创建 `after/queries/bash/injections.scm` 文件并写入以下查询：

```query
; extends

; ============================================================================
; #MISE 注释 - TOML 注入
; ============================================================================
; 此注入捕获以 "#MISE " 或 "#[MISE]" 或 "# [MISE]" 开头的注释行，
; 并将其视为 TOML 代码块进行语法高亮。
;
; #MISE 格式
; (#offset!) 指令跳过 "#MISE " 前缀（6 个字符）
((comment) @injection.content
  (#lua-match? @injection.content "^#MISE ")
  (#offset! @injection.content 0 6 0 1)
  (#set! injection.language "toml"))

; #[MISE] 格式
((comment) @injection.content
  (#lua-match? @injection.content "^#%[MISE%] ")
  (#offset! @injection.content 0 8 0 1)
  (#set! injection.language "toml"))

; # [MISE] 格式
((comment) @injection.content
  (#lua-match? @injection.content "^# %[MISE%] ")
  (#offset! @injection.content 0 9 0 1)
  (#set! injection.language "toml"))

; ============================================================================
; #USAGE 注释 - KDL 注入
; ============================================================================
; 此注入捕获以 "#USAGE " 或 "#[USAGE]" 或 "# [USAGE]" 开头的连续注释行，
; 并将其视为单个 KDL 代码块进行语法高亮。
;
; #USAGE 格式
((comment) @injection.content
  (#lua-match? @injection.content "^#USAGE ")
  ; 将范围向右扩展一个字节以包含尾部换行符。
  ; 参阅 https://github.com/neovim/neovim/discussions/36669#discussioncomment-15054154
  (#offset! @injection.content 0 7 0 1)
  (#set! injection.combined)
  (#set! injection.language "kdl"))

; #[USAGE] 格式
((comment) @injection.content
  (#lua-match? @injection.content "^#%[USAGE%] ")
  (#offset! @injection.content 0 9 0 1)
  (#set! injection.combined)
  (#set! injection.language "kdl"))

; # [USAGE] 格式
((comment) @injection.content
  (#lua-match? @injection.content "^# %[USAGE%] ")
  (#offset! @injection.content 0 10 0 1)
  (#set! injection.combined)
  (#set! injection.language "kdl"))

; 注意：在 neovim >= 0.12 上，你可以使用多节点模式来替代
; 组合注入：
;
; ((comment)+ @injection.content
;   (#lua-match? @injection.content "^#USAGE ")
;   (#offset! @injection.content 0 7 0 1)
;   (#set! injection.language "kdl"))
;
; 这是更推荐的方式，因为组合注入有多种限制：
; https://github.com/neovim/neovim/issues/32635

```

相同的查询也适用于所有使用 `#` 作为注释分隔符的语言。
由于 TS 注入是按语言区分的，你需要将相同的查询放到特定语言的查询文件中。
例如，将其放到 `after/queries/python/injections.scm` 以在 `Python` 中启用（除了 `bash`）。

对于使用 `//` 作为注释分隔符的语言，需要稍微修改查询：

```query
((comment) @injection.content
  (#lua-match? @injection.content "^//MISE ")
  (#offset! @injection.content 0 7 0 1)
  (#set! injection.language "toml"))
((comment) @injection.content
  (#lua-match? @injection.content "^//%[MISE%] ")
  (#offset! @injection.content 0 9 0 1)
  (#set! injection.language "toml"))
((comment) @injection.content
  (#lua-match? @injection.content "^// %[MISE%] ")
  (#offset! @injection.content 0 10 0 1)
  (#set! injection.language "toml"))
((comment) @injection.content
  (#lua-match? @injection.content "^//USAGE ")
  (#offset! @injection.content 0 8 0 1)
  (#set! injection.combined)
  (#set! injection.language "kdl"))
((comment) @injection.content
  (#lua-match? @injection.content "^//%[USAGE%] ")
  (#offset! @injection.content 0 10 0 1)
  (#set! injection.combined)
  (#set! injection.language "kdl"))
((comment) @injection.content
  (#lua-match? @injection.content "^// %[USAGE%] ")
  (#offset! @injection.content 0 11 0 1)
  (#set! injection.combined)
  (#set! injection.language "kdl"))
```

## 为 run 命令中的嵌入语言启用 LSP

使用 [`otter.nvim`](https://github.com/jmbuhr/otter.nvim) 为 mise 文件中嵌入的代码启用 LSP 功能和代码补全。

同样使用 [`lazy.nvim`](https://github.com/folke/lazy.nvim)：

```lua
{
  "jmbuhr/otter.nvim",
  dependencies = {
    "nvim-treesitter/nvim-treesitter",
  },
  config = function()
    vim.api.nvim_create_autocmd({ "FileType" }, {
      pattern = { "toml" },
      group = vim.api.nvim_create_augroup("EmbedToml", {}),
      callback = function()
        require("otter").activate()
      end,
    })
  end,
},
```

这只有在 [TS 注入查询](#run-命令)也设置好的情况下才有效。
