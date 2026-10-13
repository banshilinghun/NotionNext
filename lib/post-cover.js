import { siteConfig } from '@/lib/config'
import { mapImgUrl } from '@/lib/db/notion/mapImage'

export function getGeneratedCoverUrl(post = {}, { absolute = false } = {}) {
  const params = new URLSearchParams()
  params.set('title', post?.title || siteConfig('TITLE') || 'Acluxo')
  if (post?.id) {
    params.set('id', post.id)
  }
  if (post?.slug) {
    params.set('slug', post.slug)
  }
  if (post?.category) {
    params.set('category', post.category)
  }
  if (Array.isArray(post?.tags) && post.tags.length > 0) {
    params.set('tags', post.tags.slice(0, 5).join(','))
  }
  if (post?.summary) {
    params.set('summary', String(post.summary).slice(0, 180))
  }

  const path = `/api/cover?${params.toString()}`

  if (!absolute) {
    return path
  }

  try {
    return new URL(path, siteConfig('LINK') || 'https://acluxo.vercel.app').toString()
  } catch (error) {
    return path
  }
}

/**
 * 从文章内容块中找第一张图片；用于没有设置封面的文章卡片兜底
 */
function getFirstContentImage(post = {}) {
  try {
    const blocks = post?.blockMap?.block ? Object.values(post.blockMap.block) : []
    for (const b of blocks) {
      const v = b?.value
      if (!v || v.type !== 'image') {
        continue
      }
      const raw =
        v?.properties?.source?.[0]?.[0] || v?.format?.display_source || ''
      if (!raw || typeof raw !== 'string') {
        continue
      }
      const mapped = mapImgUrl(raw, v)
      if (mapped) {
        return mapped
      }
    }
  } catch (error) {
    // ignore, fall through to generated cover
  }
  return null
}

export function getPostCover(post = {}, options = {}) {
  const actualCover = post?.pageCoverThumbnail || post?.pageCover
  if (actualCover) {
    if (!options.absolute || !actualCover.startsWith('/')) {
      return actualCover
    }

    try {
      return new URL(actualCover, siteConfig('LINK') || 'https://acluxo.vercel.app').toString()
    } catch (error) {
      return actualCover
    }
  }

  // 无封面时，优先用正文第一张图，而不是随机图
  const firstImage = getFirstContentImage(post)
  if (firstImage) {
    return firstImage
  }

  return getGeneratedCoverUrl(post, options)
}
