const PEXELS_SEARCH_ENDPOINT = 'https://api.pexels.com/v1/search'
const CATEGORY_STYLES = {
  家庭: {
    start: '#f4e4d7',
    end: '#d8b59a',
    accent: '#74452b',
    chip: '#fff8f2'
  },
  行走: {
    start: '#d9ebf2',
    end: '#7faec2',
    accent: '#183f56',
    chip: '#f4fbfe'
  },
  声音: {
    start: '#e7dcc8',
    end: '#b69063',
    accent: '#3c2a17',
    chip: '#fff7ec'
  },
  default: {
    start: '#ece4d8',
    end: '#c4b29b',
    accent: '#3c342c',
    chip: '#fffaf3'
  }
}

const CATEGORY_QUERY_HINTS = {
  家庭: [
    'parent and child at home',
    'family parenting indoors',
    'mother father child learning'
  ],
  行走: [
    'travel landscape journey',
    'road trip scenery',
    'mountain city travel'
  ],
  声音: [
    'podcast microphone studio',
    'audio storytelling',
    'recording conversation'
  ]
}

const TITLE_QUERY_HINTS = [
  {
    pattern: /作业|陪学|学习|功课/,
    queries: ['parent child homework', 'family learning at home']
  },
  {
    pattern: /沟通|讲道理|顶嘴|说话|倾听/,
    queries: ['parent child communication', 'family conversation at home']
  },
  {
    pattern: /脾气|情绪|失控|愤怒|耐心/,
    queries: ['parent comforting upset child', 'family emotional support']
  },
  {
    pattern: /夫妻|婚姻|伴侣/,
    queries: ['couple communication at home', 'marriage relationship']
  },
  {
    pattern: /孩子|父母|亲子/,
    queries: ['parent and child at home', 'family parenting']
  },
  {
    pattern: /旅行|春節|春节|普洱|版纳|大理|西昌|成都|行走/,
    queries: ['travel landscape china', 'road trip travel scenery']
  },
  {
    pattern: /人工智能|AI|谷歌|Google/,
    queries: ['artificial intelligence technology', 'computer screen abstract']
  },
  {
    pattern: /品牌|商业|公司|爱马仕|皇冠/,
    queries: ['luxury craftsmanship', 'business strategy office']
  }
]

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapTitle(title = '', maxUnits = 18, maxLines = 3) {
  const chars = Array.from(String(title).trim())
  const lines = []
  let line = ''
  let units = 0

  const charUnits = char => (/[\u0000-\u00ff]/.test(char) ? 0.55 : 1)

  for (const char of chars) {
    const nextUnits = units + charUnits(char)
    if (nextUnits > maxUnits && line) {
      lines.push(line)
      if (lines.length >= maxLines) break
      line = char
      units = charUnits(char)
    } else {
      line += char
      units = nextUnits
    }
  }

  if (lines.length < maxLines && line) {
    lines.push(line)
  }

  if (lines.length === maxLines && chars.length > lines.join('').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, -1)}…`
  }

  return lines
}

function normalizeWhitespace(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function splitTags(tags = '') {
  return normalizeWhitespace(tags)
    .split(/[，,]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function buildSearchQueries({ title, category, tags, summary }) {
  const queries = []
  const seen = new Set()
  const push = query => {
    const normalized = normalizeWhitespace(query)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    queries.push(normalized)
  }

  push(`${category} ${title}`.trim())
  push(title)

  const tagList = splitTags(tags).slice(0, 3)
  tagList.forEach(tag => push(`${title} ${tag}`))

  const categoryHints = CATEGORY_QUERY_HINTS[category] || []
  categoryHints.forEach(push)

  TITLE_QUERY_HINTS.forEach(({ pattern, queries: hintQueries }) => {
    if (pattern.test(title) || pattern.test(summary)) {
      hintQueries.forEach(push)
    }
  })

  if (summary) {
    push(summary.slice(0, 80))
  }

  return queries.slice(0, 8)
}

function scorePhoto(photo, queryTokens = []) {
  let score = 0
  const alt = normalizeWhitespace(photo?.alt || '').toLowerCase()
  const width = Number(photo?.width || 0)
  const height = Number(photo?.height || 0)

  if (width >= height) score += 3
  if (width / Math.max(height, 1) >= 1.3) score += 2
  if (width >= 1200) score += 2

  queryTokens.forEach(token => {
    if (token && alt.includes(token)) {
      score += 1
    }
  })

  return score
}

async function searchPexelsPhoto({ title, category, tags, summary }) {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    return null
  }

  const queries = buildSearchQueries({ title, category, tags, summary })
  if (queries.length === 0) {
    return null
  }

  for (const query of queries) {
    const url = new URL(PEXELS_SEARCH_ENDPOINT)
    url.searchParams.set('query', query)
    url.searchParams.set('per_page', '12')
    url.searchParams.set('orientation', 'landscape')
    url.searchParams.set('size', 'large')
    url.searchParams.set('locale', 'zh-CN')

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey
      }
    })

    if (!response.ok) {
      continue
    }

    const payload = await response.json()
    const photos = Array.isArray(payload?.photos) ? payload.photos : []
    if (photos.length === 0) {
      continue
    }

    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .map(token => token.trim())
      .filter(token => token.length > 1)

    const bestPhoto = [...photos]
      .sort((a, b) => scorePhoto(b, tokens) - scorePhoto(a, tokens))[0]

    if (bestPhoto?.src?.large2x || bestPhoto?.src?.large || bestPhoto?.src?.landscape) {
      return bestPhoto
    }
  }

  return null
}

function buildFallbackSvg({ title, category }) {
  const theme = CATEGORY_STYLES[category] || CATEGORY_STYLES.default
  const lines = wrapTitle(title)
  const lineHeight = 82
  const titleTop = 220

  const titleSvg = lines
    .map((line, index) => {
      return `<text x="88" y="${titleTop + index * lineHeight}" font-size="54" font-weight="700" fill="${theme.accent}" font-family="'Noto Sans SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif">${escapeXml(line)}</text>`
    })
    .join('')

  const categoryChip = category
    ? `<rect x="88" y="86" rx="26" ry="26" width="${Math.max(
        150,
        88 + category.length * 32
      )}" height="52" fill="${theme.chip}" opacity="0.96" />
       <text x="122" y="121" font-size="28" font-weight="600" fill="${theme.accent}" font-family="'Noto Sans SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif">${escapeXml(category)}</text>`
    : ''

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="54" y1="48" x2="1146" y2="582" gradientUnits="userSpaceOnUse">
      <stop stop-color="${theme.start}" />
      <stop offset="1" stop-color="${theme.end}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#f6f1e8" />
  <rect x="42" y="42" width="1116" height="546" rx="36" fill="url(#bg)" />
  <circle cx="1008" cy="122" r="124" fill="${theme.chip}" opacity="0.38" />
  <circle cx="1098" cy="518" r="168" fill="${theme.chip}" opacity="0.2" />
  <path d="M62 466C188 408 308 392 432 418C596 452 658 534 840 536C954 538 1052 504 1138 434V588H62V466Z" fill="${theme.chip}" opacity="0.45" />
  ${categoryChip}
  ${titleSvg}
  <text x="88" y="560" font-size="24" letter-spacing="8" fill="${theme.accent}" opacity="0.72" font-family="ui-serif,Georgia,serif">ACLUXO</text>
</svg>`

  return svg
}

export default async function handler(req, res) {
  const title = normalizeWhitespace(req.query.title || 'Acluxo')
  const category = normalizeWhitespace(req.query.category || '')
  const tags = normalizeWhitespace(req.query.tags || '')
  const summary = normalizeWhitespace(req.query.summary || '')

  try {
    const photo = await searchPexelsPhoto({ title, category, tags, summary })
    const imageUrl =
      photo?.src?.large2x || photo?.src?.large || photo?.src?.landscape

    if (imageUrl) {
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800')
      res.setHeader('X-Cover-Source', 'pexels')
      res.redirect(307, imageUrl)
      return
    }
  } catch (error) {
    console.warn('[cover-api] pexels search failed:', error)
  }

  const svg = buildFallbackSvg({ title, category })
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800')
  res.setHeader('X-Cover-Source', 'fallback')
  res.status(200).send(svg)
}
