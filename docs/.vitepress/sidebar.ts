import fs from 'node:fs'
import path from 'node:path'

export interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

interface PostMeta {
  title: string
  date: string
  category: string
  link: string
}

const FALLBACK_CATEGORY = '未分类'
const PINNED_CATEGORY = '置顶'

function normalizeCategory(value: string | undefined): string {
  const category = (value || '').trim()
  return category || FALLBACK_CATEGORY
}

function sortCategories(a: string, b: string, grouped: Map<string, PostMeta[]>): number {
  // 「置顶」始终排最前
  if (a === PINNED_CATEGORY) return -1
  if (b === PINNED_CATEGORY) return 1

  // 「未分类」始终排在最后
  if (a === FALLBACK_CATEGORY) return 1
  if (b === FALLBACK_CATEGORY) return -1

  const latest = (cat: string) =>
    grouped.get(cat)?.reduce((max, post) => (post.date > max ? post.date : max), '') || ''

  const dateCmp = latest(b).localeCompare(latest(a))
  if (dateCmp !== 0) return dateCmp

  return a.localeCompare(b, 'zh-CN')
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    result[key] = value
  }
  return result
}

function sortPosts(a: PostMeta, b: PostMeta): number {
  if (a.date && b.date) return b.date.localeCompare(a.date)
  if (a.date) return -1
  if (b.date) return 1
  return a.title.localeCompare(b.title, 'zh-CN')
}

/** 扫描 posts 目录，根据 frontmatter 自动生成侧边栏分组。 */
export function buildPostsSidebar(postsDir: string): SidebarItem[] {
  if (!fs.existsSync(postsDir)) return []

  const posts: PostMeta[] = fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const content = fs.readFileSync(path.join(postsDir, file), 'utf-8')
      const fm = parseFrontmatter(content)
      return {
        title: fm.title || slug,
        date: fm.date || '',
        category: normalizeCategory(fm.category),
        link: `/posts/${slug}`,
      }
    })

  const grouped = new Map<string, PostMeta[]>()

  for (const post of posts) {
    const category = normalizeCategory(post.category)
    post.category = category
    if (!grouped.has(category)) grouped.set(category, [])
    grouped.get(category)!.push(post)
  }

  const categories = [...grouped.keys()].sort((a, b) => sortCategories(a, b, grouped))

  return categories.map((category) => {
    const items = grouped.get(category)!
    items.sort(sortPosts)
    return {
      text: category,
      collapsed: false,
      items: items.map((post) => ({ text: post.title, link: post.link })),
    }
  })
}
