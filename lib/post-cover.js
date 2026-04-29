import { siteConfig } from '@/lib/config'

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

export function getPostCover(post = {}, options = {}) {
  const actualCover = post?.pageCoverThumbnail || post?.pageCover
  if (!actualCover) {
    return getGeneratedCoverUrl(post, options)
  }

  if (!options.absolute || !actualCover.startsWith('/')) {
    return actualCover
  }

  try {
    return new URL(actualCover, siteConfig('LINK') || 'https://acluxo.vercel.app').toString()
  } catch (error) {
    return actualCover
  }
}
