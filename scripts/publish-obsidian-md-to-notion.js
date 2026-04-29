#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const NOTION_API_BASE = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i++
    }
  }
  return args
}

function readEnvFromExampleCompatibleFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function ensureEnvLoaded() {
  const cwd = process.cwd()
  readEnvFromExampleCompatibleFile(path.join(cwd, '.env.local'))
  readEnvFromExampleCompatibleFile(path.join(cwd, '.env'))
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) {
    return { data: {}, content: markdown }
  }

  const end = markdown.indexOf('\n---\n', 4)
  if (end === -1) {
    return { data: {}, content: markdown }
  }

  const raw = markdown.slice(4, end)
  const content = markdown.slice(end + 5)
  const data = {}

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue
    const [, key, value] = match
    data[key] = parseYamlScalar(value)
  }

  return { data, content }
}

function parseYamlScalar(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => item.replace(/^['"]|['"]$/g, ''))
  }
  return trimmed
}

function stripMarkdown(value = '') {
  return String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/[*_~#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(input = '') {
  return String(input)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

function inferTitle(filePath, frontmatter, markdown) {
  if (frontmatter.title) return String(frontmatter.title)
  const heading = markdown.match(/^#\s+(.+)$/m)
  if (heading) return heading[1].trim()
  return path.basename(filePath, path.extname(filePath))
}

function inferDate(filePath, frontmatter) {
  const explicit = frontmatter.date || frontmatter.publishDate || frontmatter.created
  if (explicit && /^\d{4}-\d{2}-\d{2}/.test(String(explicit))) {
    return String(explicit).slice(0, 10)
  }
  const stat = fs.statSync(filePath)
  return new Date(stat.mtimeMs).toISOString().slice(0, 10)
}

function inferTags(frontmatter, cliTags) {
  const tags = []
  const pushTags = value => {
    if (!value) return
    if (Array.isArray(value)) {
      value.forEach(pushTags)
      return
    }
    String(value)
      .split(/[,\n]/)
      .map(item => item.trim())
      .filter(Boolean)
      .forEach(item => tags.push(item.replace(/^#/, '')))
  }
  pushTags(frontmatter.tags)
  pushTags(frontmatter.tag)
  pushTags(cliTags)
  return [...new Set(tags)]
}

function inferSummary(frontmatter, markdown) {
  if (frontmatter.summary) return String(frontmatter.summary)
  if (frontmatter.description) return String(frontmatter.description)
  return stripMarkdown(markdown).slice(0, 160)
}

function chunkText(text, maxLength = 1800) {
  const chunks = []
  let rest = String(text)
  while (rest.length > maxLength) {
    chunks.push(rest.slice(0, maxLength))
    rest = rest.slice(maxLength)
  }
  if (rest) chunks.push(rest)
  return chunks
}

function richText(text, annotations = {}) {
  return chunkText(text).map(content => ({
    type: 'text',
    text: { content },
    annotations
  }))
}

function markdownToBlocks(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let listType = null
  let codeLang = null
  let codeLines = []

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim()
    if (!text) {
      paragraph = []
      return
    }
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: richText(text) }
    })
    paragraph = []
  }

  const flushCode = () => {
    if (codeLines.length === 0) return
    blocks.push({
      object: 'block',
      type: 'code',
      code: {
        language: codeLang || 'plain text',
        rich_text: richText(codeLines.join('\n'))
      }
    })
    codeLang = null
    codeLines = []
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '  ')

    if (line.startsWith('```')) {
      flushParagraph()
      if (codeLang !== null) {
        flushCode()
      } else {
        codeLang = line.slice(3).trim() || 'plain text'
      }
      continue
    }

    if (codeLang !== null) {
      codeLines.push(rawLine)
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      listType = null
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      listType = null
      const level = heading[1].length
      const type = level === 1 ? 'heading_1' : level === 2 ? 'heading_2' : 'heading_3'
      blocks.push({
        object: 'block',
        type,
        [type]: { rich_text: richText(heading[2].trim()) }
      })
      continue
    }

    const todo = line.match(/^-\s+\[( |x)]\s+(.+)$/i)
    if (todo) {
      flushParagraph()
      listType = null
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          checked: todo[1].toLowerCase() === 'x',
          rich_text: richText(todo[2].trim())
        }
      })
      continue
    }

    const bullet = line.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      flushParagraph()
      listType = 'bulleted_list_item'
      blocks.push({
        object: 'block',
        type: listType,
        [listType]: { rich_text: richText(bullet[1].trim()) }
      })
      continue
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/)
    if (numbered) {
      flushParagraph()
      listType = 'numbered_list_item'
      blocks.push({
        object: 'block',
        type: listType,
        [listType]: { rich_text: richText(numbered[1].trim()) }
      })
      continue
    }

    const quote = line.match(/^>\s+(.+)$/)
    if (quote) {
      flushParagraph()
      listType = null
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: { rich_text: richText(quote[1].trim()) }
      })
      continue
    }

    paragraph.push(line.trim())
  }

  flushParagraph()
  flushCode()
  return blocks.slice(0, 100)
}

async function notionRequest(pathname, { method = 'GET', body, token }) {
  const response = await fetch(`${NOTION_API_BASE}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(payload)}`)
  }
  return payload
}

async function appendBlocks(pageId, blocks, token) {
  for (let i = 0; i < blocks.length; i += 100) {
    await notionRequest(`/blocks/${pageId}/children`, {
      method: 'PATCH',
      token,
      body: { children: blocks.slice(i, i + 100) }
    })
  }
}

function buildProperties({ title, slug, date, category, tags, summary, status }) {
  return {
    title: {
      title: [{ type: 'text', text: { content: title } }]
    },
    slug: {
      rich_text: [{ type: 'text', text: { content: slug } }]
    },
    summary: {
      rich_text: [{ type: 'text', text: { content: summary } }]
    },
    category: {
      select: { name: category }
    },
    tags: {
      multi_select: tags.map(name => ({ name }))
    },
    date: {
      date: { start: date }
    },
    type: {
      select: { name: 'Post' }
    },
    status: {
      select: { name: status }
    }
  }
}

async function createPost({ databaseId, token, metadata, blocks }) {
  const page = await notionRequest('/pages', {
    method: 'POST',
    token,
    body: {
      parent: { database_id: databaseId },
      properties: buildProperties(metadata),
      children: blocks.slice(0, 100)
    }
  })

  if (blocks.length > 100) {
    await appendBlocks(page.id, blocks.slice(100), token)
  }

  return page
}

function printUsage() {
  console.log(`Usage:
  node scripts/publish-obsidian-md-to-notion.js \\
    --file "/absolute/path/to/note.md" \\
    --category 家庭 \\
    [--status Published] \\
    [--slug custom-slug] \\
    [--title "Custom Title"] \\
    [--tags "tag1,tag2"] \\
    [--date 2026-04-29] \\
    [--dry-run]

Required env:
  NOTION_API_TOKEN   Official Notion integration token
  NOTION_DATABASE_ID Target database id

Optional fallback:
  NOTION_PAGE_ID     Used when NOTION_DATABASE_ID is missing
`)
}

async function main() {
  ensureEnvLoaded()
  const args = parseArgs(process.argv.slice(2))

  if (args.help || !args.file) {
    printUsage()
    process.exit(args.help ? 0 : 1)
  }

  const filePath = path.resolve(args.file)
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const markdown = fs.readFileSync(filePath, 'utf8')
  const { data: frontmatter, content } = parseFrontmatter(markdown)

  const title = args.title || inferTitle(filePath, frontmatter, content)
  const category = args.category || frontmatter.category
  if (!category) {
    throw new Error('Missing category. Pass --category or set frontmatter category.')
  }

  const status = args.status || frontmatter.status || 'Published'
  const date = args.date || inferDate(filePath, frontmatter)
  const tags = inferTags(frontmatter, args.tags)
  const summary = inferSummary(frontmatter, content)
  const slug = args.slug || frontmatter.slug || slugify(title)
  const blocks = markdownToBlocks(content)

  const metadata = {
    title,
    slug,
    date,
    category,
    tags,
    summary,
    status
  }

  if (args['dry-run']) {
    console.log(JSON.stringify({
      file: filePath,
      metadata,
      blockCount: blocks.length,
      previewBlocks: blocks.slice(0, 5)
    }, null, 2))
    return
  }

  const token = process.env.NOTION_API_TOKEN
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID
  if (!token) {
    throw new Error('Missing NOTION_API_TOKEN')
  }
  if (!databaseId) {
    throw new Error('Missing NOTION_DATABASE_ID or NOTION_PAGE_ID')
  }

  const page = await createPost({
    databaseId,
    token,
    metadata,
    blocks
  })

  console.log(JSON.stringify({
    ok: true,
    id: page.id,
    url: page.url,
    title,
    slug,
    category,
    status
  }, null, 2))
}

main().catch(error => {
  console.error('[publish-obsidian-md-to-notion] failed')
  console.error(error.message || error)
  process.exit(1)
})
