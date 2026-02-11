import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import CONFIG from '../config'
import { BlogItem } from './BlogItem'

/**
 * 博客列表
 * @param {*} props
 * @returns
 */
export default function BlogListPage(props) {
  const { page = 1, posts, postCount } = props
  const router = useRouter()
  const { NOTION_CONFIG } = useGlobal()
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG)
  const totalPage = Math.ceil(postCount / POSTS_PER_PAGE)
  const currentPage = +page

  // 博客列表嵌入广告
  const SIMPLE_POST_AD_ENABLE = siteConfig(
    'SIMPLE_POST_AD_ENABLE',
    false,
    CONFIG
  )

  const showPrev = currentPage > 1
  const showNext = page < totalPage
  const pagePrefix = router.asPath
    .split('?')[0]
    .replace(/\/page\/[1-9]\d*/, '')
    .replace(/\/$/, '')
    .replace('.html', '')

  const featuredPost = posts?.[0]
  const restPosts = posts?.slice(1) || []

  return (
    <div className='w-full mb-12'>
      {featuredPost && (
        <div id='posts-wrapper' className='mb-8'>
          <BlogItem post={featuredPost} featured />
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-7'>
        {restPosts.map((p, index) => (
          <Fragment key={p.id}>
            {SIMPLE_POST_AD_ENABLE && (index + 1) % 4 === 0 && (
              <div key={`${p.id}-ad-in`} className='col-span-full'>
                <AdSlot type='in-article' />
              </div>
            )}
            <BlogItem post={p} />
          </Fragment>
        ))}
      </div>

      <div className='flex justify-between text-xs mt-4'>
        <SmartLink
          href={{
            pathname:
              currentPage - 1 === 1
                ? `${pagePrefix}/`
                : `${pagePrefix}/page/${currentPage - 1}`,
            query: router.query.s ? { s: router.query.s } : {}
          }}
          className={`${showPrev ? 'text-gray-700 border-b border-gray-400 visible ' : ' invisible bg-gray pointer-events-none '} no-underline pb-1 px-3 tracking-wider uppercase`}>
          NEWER POSTS <i className='fa-solid fa-arrow-left'></i>
        </SmartLink>
        <SmartLink
          href={{
            pathname: `${pagePrefix}/page/${currentPage + 1}`,
            query: router.query.s ? { s: router.query.s } : {}
          }}
          className={`${showNext ? 'text-gray-700 border-b border-gray-400 visible' : ' invisible bg-gray pointer-events-none '} no-underline pb-1 px-3 tracking-wider uppercase`}>
          OLDER POSTS <i className='fa-solid fa-arrow-right'></i>
        </SmartLink>
      </div>
    </div>
  )
}
