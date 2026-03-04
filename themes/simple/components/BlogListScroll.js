import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { useCallback, useEffect, useRef, useState } from 'react'
import CONFIG from '../config'
import { BlogItem } from './BlogItem'

/**
 * 滚动博客列表
 * @param {*} props
 * @returns
 */
export default function BlogListScroll(props) {
  const { posts } = props
  const { locale, NOTION_CONFIG } = useGlobal()
  const [page, updatePage] = useState(1)
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG)
  let hasMore = false
  const postsToShow = posts
    ? Object.assign(posts).slice(0, POSTS_PER_PAGE * page)
    : []

  if (posts) {
    const totalCount = posts.length
    hasMore = page * POSTS_PER_PAGE < totalCount
  }
  const handleGetMore = () => {
    if (!hasMore) return
    updatePage(page + 1)
  }

  const targetRef = useRef(null)

  // 监听滚动自动分页加载
  const scrollTrigger = useCallback(
    throttle(() => {
      const scrollS = window.scrollY + window.outerHeight
      const clientHeight = targetRef
        ? targetRef.current
          ? targetRef.current.clientHeight
          : 0
        : 0
      if (scrollS > clientHeight + 100) {
        handleGetMore()
      }
    }, 500)
  )

  useEffect(() => {
    window.addEventListener('scroll', scrollTrigger)

    return () => {
      window.removeEventListener('scroll', scrollTrigger)
    }
  })

  const SIMPLE_FEATURED_TAG = siteConfig(
    'SIMPLE_FEATURED_TAG',
    'Featured',
    CONFIG
  )

  const isFeatured = p =>
    SIMPLE_FEATURED_TAG &&
    Array.isArray(p?.tags) &&
    p.tags.includes(SIMPLE_FEATURED_TAG)

  const featuredPost = postsToShow?.find(isFeatured) || postsToShow?.[0]
  const restPosts = featuredPost
    ? postsToShow.filter(p => p?.id !== featuredPost?.id)
    : postsToShow

  return (
    <div id='posts-wrapper' className='w-full mb-12' ref={targetRef}>
      {featuredPost && (
        <div className='mb-8'>
          <BlogItem post={featuredPost} featured />
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-7'>
        {restPosts.map(p => (
          <BlogItem key={p.id} post={p} />
        ))}
      </div>

      <div
        onClick={handleGetMore}
        className='w-full my-6 py-4 text-center cursor-pointer text-xs tracking-[0.15em] uppercase text-[#8a7f73] hover:text-[#2b241c] transition-colors duration-200'>
        {hasMore ? locale.COMMON.MORE : `${locale.COMMON.NO_MORE}`}
      </div>
    </div>
  )
}
