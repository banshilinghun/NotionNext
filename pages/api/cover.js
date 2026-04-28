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

export default function handler(req, res) {
  const title = String(req.query.title || 'Acluxo').trim()
  const category = String(req.query.category || '').trim()
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

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800')
  res.status(200).send(svg)
}
