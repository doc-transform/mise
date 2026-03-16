import { defineConfig } from "vitepress";
import { Command, commands } from "./cli_commands";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import { withMermaid } from "vitepress-plugin-mermaid";
import kdlGrammar from "./grammars/kdl.tmLanguage.json";
import miseTomlGrammar from "./grammars/mise-toml.tmLanguage.json";

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    title: "mise-en-place",
    description: "mise-en-place documentation",
    lang: "zh-CN",
    lastUpdated: true,
    appearance: true,
    mermaid: {},
    sitemap: {
      hostname: "https://mise.jdx.dev",
    },
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      logo: { light: "/logo-light.svg", dark: "/logo-dark.svg" },
      outline: "deep",
      nav: [
        { text: "mise-versions", link: "https://mise-versions.jdx.dev/" },
        { text: "开发工具", link: "/dev-tools/" },
        { text: "环境变量", link: "/environments/" },
        { text: "任务", link: "/tasks/" },
      ],
      sidebar: [
        {
          text: "指南",
          items: [
            { text: "演示", link: "/demo" },
            { text: "快速开始", link: "/getting-started" },
            { text: "使用教程", link: "/walkthrough" },
            { text: "安装 mise", link: "/installing-mise" },
            { text: "IDE 集成", link: "/ide-integration" },
            { text: "持续集成", link: "/continuous-integration" },
          ],
        },
        {
          text: "配置",
          items: [
            { text: "mise.toml", link: "/configuration" },
            { text: "设置项", link: "/configuration/settings" },
            {
              text: "配置环境",
              link: "/configuration/environments",
            },
          ],
        },
        {
          text: "开发工具",
          items: [
            { text: "开发工具概览", link: "/dev-tools/" },
            {
              text: "与 asdf 对比",
              link: "/dev-tools/comparison-to-asdf",
            },
            { text: "Shims", link: "/dev-tools/shims" },
            { text: "工具别名", link: "/dev-tools/aliases" },
            { text: "工具桩", link: "/dev-tools/tool-stubs" },
            { text: "工具注册表", link: "/registry" },
            { text: "mise.lock 锁文件", link: "/dev-tools/mise-lock" },
            { text: "预安装", link: "/dev-tools/prepare" },
            {
              text: "工具源架构",
              link: "/dev-tools/backend_architecture",
            },
            {
              text: "核心工具",
              link: "/core-tools",
              collapsed: true,
              items: [
                { text: "Bun", link: "/lang/bun" },
                { text: "Deno", link: "/lang/deno" },
                { text: "Elixir", link: "/lang/elixir" },
                { text: "Erlang", link: "/lang/erlang" },
                { text: "Go", link: "/lang/go" },
                { text: "Java", link: "/lang/java" },
                { text: "Node.js", link: "/lang/node" },
                { text: "Python", link: "/lang/python" },
                { text: "Ruby", link: "/lang/ruby" },
                { text: "Rust", link: "/lang/rust" },
                { text: "Swift", link: "/lang/swift" },
                { text: "Zig", link: "/lang/zig" },
              ],
            },
            {
              text: "工具源",
              link: "/dev-tools/backends/",
              collapsed: true,
              items: [
                { text: "aqua", link: "/dev-tools/backends/aqua" },
                { text: "asdf", link: "/dev-tools/backends/asdf" },
                { text: "cargo", link: "/dev-tools/backends/cargo" },
                { text: "conda", link: "/dev-tools/backends/conda" },
                { text: "dotnet", link: "/dev-tools/backends/dotnet" },
                { text: "forgejo", link: "/dev-tools/backends/forgejo" },
                { text: "gem", link: "/dev-tools/backends/gem" },
                { text: "github", link: "/dev-tools/backends/github" },
                { text: "gitlab", link: "/dev-tools/backends/gitlab" },
                { text: "go", link: "/dev-tools/backends/go" },
                { text: "http", link: "/dev-tools/backends/http" },
                { text: "npm", link: "/dev-tools/backends/npm" },
                { text: "pipx", link: "/dev-tools/backends/pipx" },
                { text: "spm", link: "/dev-tools/backends/spm" },
                { text: "ubi", link: "/dev-tools/backends/ubi" },
                { text: "vfox", link: "/dev-tools/backends/vfox" },
              ],
            },
          ],
        },
        {
          text: "环境变量",
          items: [
            { text: "环境变量管理", link: "/environments/" },
            { text: "Shell 别名", link: "/shell-aliases" },
            {
              text: "密钥管理",
              link: "/environments/secrets/",
              collapsed: true,
              items: [
                { text: "sops", link: "/environments/secrets/sops" },
                { text: "age", link: "/environments/secrets/age" },
              ],
            },
            { text: "钩子", link: "/hooks" },
            { text: "direnv", link: "/direnv" },
          ],
        },
        {
          text: "任务",
          items: [
            { text: "任务概览", link: "/tasks/" },
            { text: "任务架构", link: "/tasks/architecture" },
            { text: "运行任务", link: "/tasks/running-tasks" },
            { text: "TOML 任务", link: "/tasks/toml-tasks" },
            { text: "文件任务", link: "/tasks/file-tasks" },
            { text: "任务参数", link: "/tasks/task-arguments" },
            { text: "任务配置", link: "/tasks/task-configuration" },
            { text: "任务模板", link: "/tasks/templates" },
            { text: "Monorepo 任务", link: "/tasks/monorepo" },
          ],
        },
        {
          text: "插件",
          items: [
            { text: "插件概览", link: "/plugins" },
            { text: "使用插件", link: "/plugin-usage" },
            {
              text: "工具源插件开发",
              link: "/backend-plugin-development",
            },
            {
              text: "工具插件开发",
              link: "/tool-plugin-development",
            },
            {
              text: "环境插件开发",
              link: "/env-plugin-development",
            },
            { text: "插件 Lua 模块", link: "/plugin-lua-modules" },
            { text: "插件发布", link: "/plugin-publishing" },
            { text: "asdf（旧版）插件", link: "/asdf-legacy-plugins" },
          ],
        },
        {
          text: "关于",
          items: [
            { text: "关于 mise", link: "/about" },
            { text: "术语表", link: "/glossary" },
            { text: "常见问题", link: "/faq" },
            { text: "故障排查", link: "/troubleshooting" },
            { text: "技巧与窍门", link: "/tips-and-tricks" },
            {
              text: "实用示例",
              link: "/mise-cookbook/",
              collapsed: true,
              items: [
                { text: "C++", link: "/mise-cookbook/cpp" },
                { text: "Docker", link: "/mise-cookbook/docker" },
                { text: "Node", link: "/mise-cookbook/nodejs" },
                { text: "Ruby", link: "/mise-cookbook/ruby" },
                { text: "Terraform", link: "/mise-cookbook/terraform" },
                { text: "Python", link: "/mise-cookbook/python" },
                { text: "预设配置", link: "/mise-cookbook/presets" },
                { text: "Shell 技巧", link: "/mise-cookbook/shell-tricks" },
              ],
            },
            { text: "团队", link: "/team" },
            { text: "贡献指南", link: "/contributing" },
            { text: "外部资源", link: "/external-resources" },
          ],
        },
        {
          text: "进阶",
          items: [
            { text: "架构设计", link: "/architecture" },
            { text: "安全模式", link: "/paranoid" },
            { text: "模板语法", link: "/templates" },
            { text: "URL 替换", link: "/url-replacements" },
            { text: "Model Context Protocol", link: "/mcp" },
            { text: "我如何使用 mise", link: "/how-i-use-mise" },
            { text: "目录结构", link: "/directories" },
            { text: "缓存机制", link: "/cache-behavior" },
          ],
        },
        {
          text: "CLI 参考",
          collapsed: true,
          items: [
            { text: "CLI 概览", link: "/cli/" },
            ...cliReference(commands),
          ],
        },
      ],

      socialLinks: [
        { icon: "github", link: "https://github.com/jdx/mise" },
        { icon: "discord", link: "https://discord.gg/UBa7pJUN7Z" },
      ],

      editLink: {
        pattern: "https://github.com/jdx/mise/edit/main/docs/:path",
      },
      search: {
        provider: "algolia",
        options: {
          indexName: "rtx",
          appId: "1452G4RPSJ",
          apiKey: "ad09b96a7d2a30eddc2771800da7a1cf",
          insights: true,
        },
      },
      footer: {
        message:
          '基于 MIT 许可证开源。由 <a href="https://github.com/jdx">@jdx</a> 及<a href="https://github.com/jdx/mise/graphs/contributors">贡献者们</a>共同维护。',
        copyright: `Copyright © ${new Date().getFullYear()} <a href="https://github.com/jdx">@jdx</a>`,
      },

    },
    markdown: {
      languages: [
        // Load base languages needed for embedded support
        "toml",
        "shell",
        "bash",
        // TODO: Once Shiki bundles KDL (tracked in shikijs/textmate-grammars-themes),
        // we can import it from 'shiki/langs/kdl' instead of storing locally
        {
          ...kdlGrammar,
          name: "kdl",
          scopeName: "source.kdl",
        } as any,
        // Custom mise.toml grammar with embedded KDL (usage fields) and bash (run fields)
        {
          ...miseTomlGrammar,
          name: "mise-toml",
          aliases: ["mise.toml"],
          scopeName: "source.mise-toml",
        } as any,
      ],
      config(md) {
        md.use(groupIconMdPlugin);
        md.use(tabsMarkdownPlugin);
      },
    },
    vite: {
      plugins: [
        groupIconVitePlugin({
          customIcon: {
            ".toml": "vscode-icons:file-type-toml",
            brew: "logos:homebrew",
            python: "logos:python",
            node: "logos:nodejs",
            ruby: "logos:ruby",
          },
        }),
      ],
    },
    head: [
      // Favicon
      ["link", { rel: "icon", href: "/favicon.ico", sizes: "any" }],
      [
        "link",
        {
          rel: "icon",
          href: "/favicon-16x16.png",
          type: "image/png",
          sizes: "16x16",
        },
      ],
      [
        "link",
        {
          rel: "icon",
          href: "/favicon-32x32.png",
          type: "image/png",
          sizes: "32x32",
        },
      ],
      ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
      [
        "link",
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
      ],
      // Google Fonts
      [
        "link",
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
      ],
      [
        "link",
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
      ],
      [
        "link",
        {
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
          rel: "stylesheet",
        },
      ],
      // Analytics
      [
        "script",
        {
          async: "",
          src: "https://www.googletagmanager.com/gtag/js?id=G-B69G389C8T",
        },
      ],
      [
        "script",
        {},
        `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-B69G389C8T');`,
      ],
      [
        "script",
        {
          "data-goatcounter": "https://jdx.goatcounter.com/count",
          async: "",
          src: "//gc.zgo.at/count.js",
        },
      ],
      // OpenGraph
      ["meta", { property: "og:site_name", content: "mise-en-place" }],
      ["meta", { property: "og:type", content: "website" }],
      [
        "meta",
        {
          property: "og:image",
          content: "https://mise.jdx.dev/android-chrome-512x512.png",
        },
      ],
      ["meta", { name: "twitter:card", content: "summary" }],
      [
        "meta",
        {
          name: "twitter:image",
          content: "https://mise.jdx.dev/android-chrome-512x512.png",
        },
      ],
    ],
    transformPageData(pageData) {
      const canonicalUrl = `https://mise.jdx.dev/${pageData.relativePath}`
        .replace(/index\.md$/, "")
        .replace(/\.md$/, ".html");

      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push([
        "link",
        { rel: "canonical", href: canonicalUrl },
      ]);
      pageData.frontmatter.head.push([
        "link",
        {
          rel: "sitemap",
          href: "https://mise.jdx.dev/sitemap.xml",
          type: "application/xml",
          title: "Sitemap",
        },
      ]);
    },
  }),
);

function cliReference(commands: { [key: string]: Command }) {
  return Object.keys(commands)
    .map((name) => [name, commands[name]] as [string, Command])
    .filter(([_name, command]) => command.hide !== true)
    .map(([name, command]) => {
      const x: any = {
        text: `mise ${name}`,
        link: `/cli/${name}`,
      };
      if (command.subcommands) {
        x.collapsed = true;
        x.items = Object.keys(command.subcommands)
          .filter(
            (subcommand) => command.subcommands![subcommand].hide !== true,
          )
          .map((subcommand) => ({
            text: `mise ${name} ${subcommand}`,
            link: `/cli/${name}/${subcommand}`,
          }));
      }
      return x;
    });
}
