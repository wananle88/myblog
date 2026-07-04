import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildPostsSidebar } from './sidebar'

const dir = path.dirname(fileURLToPath(import.meta.url))
const postsDir = path.resolve(dir, '../posts')

export default defineConfig({
  base: '/blog/',
  lang: 'zh-CN',
  title: '我的博客',
  description: '记录点点滴滴',
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
    ],
    sidebar: {
      '/posts/': buildPostsSidebar(postsDir),
    },
    socialLinks: [],
    footer: {
      message: '我的博客',
      copyright: 'Copyright © 2026',
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outline: {
      label: '目录',
    },
    lastUpdated: {
      text: '最后更新',
    },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '语言',
  },
  markdown: {
    html: true,
  },
})
