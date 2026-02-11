import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

export const BlogItem = props => {
  const { post } = props
  const { NOTION_CONFIG } = useGlobal()
  const showPageCover = siteConfig('SIMPLE_POST_COVER_ENABLE', false, CONFIG)
  const showPreview =
    siteConfig('POST_LIST_PREVIEW', false, NOTION_CONFIG) && post.blockMap

  return (
    <div
      key={post.id}
      className='h-full rounded-2xl border border-stone-200/80 dark:border-gray-800 bg-white/95 dark:bg-black/60 shadow-[0_1px_6px_rgba(28,25,23,0.06)] hover:shadow-[0_8px_24px_rgba(28,25,23,0.10)] transition-shadow duration-300'>
      {/* 封面图 */}
      {showPageCover && (
        <SmartLink href={post.href} passHref legacyBehavior>
          <div className='overflow-hidden rounded-t-2xl'>
            <LazyImage
              src={post?.pageCoverThumbnail}
              className='w-full aspect-[16/9] object-cover object-center hover:scale-[1.015] duration-500'
            />
          </div>
        </SmartLink>
      )}

      <article className='p-7 md:p-8'>
        <h2 className='mb-4'>
          <SmartLink
            href={post.href}
            className='blog-item-title text-gray-900 dark:text-white text-[1.9rem] md:text-[2.2rem] leading-tight'>
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post.pageIcon} />
            )}
            {post.title}
          </SmartLink>
        </h2>

        {/* 文章信息 */}
        <header className='mb-5 text-xs md:text-sm text-gray-500 dark:text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-2'>
          <span className='inline-flex items-center gap-1'>
            <i className='fa-regular fa-user'></i>
            {siteConfig('AUTHOR')}
          </span>
          <SmartLink
            className='inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors duration-200'
            href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}>
            <i className='fa-regular fa-clock' />
            {post.date?.start_date || post.createdTime}
          </SmartLink>
          {post.category && (
            <SmartLink
              href={`/category/${post.category}`}
              className='inline-flex items-center gap-1'>
              <i className='fa-regular fa-folder' />
              {post.category}
            </SmartLink>
          )}
        </header>

        <main className='text-stone-600 dark:text-gray-300 leading-[1.9] mb-7 text-base'>
          {!showPreview && (
            <>
              {post.summary}
              {post.summary && <span>...</span>}
            </>
          )}
          {showPreview && post?.blockMap && (
            <div className='overflow-ellipsis truncate'>
              <NotionPage post={post} />
              <hr className='border-dashed py-4' />
            </div>
          )}
        </main>

        <div className='pt-2'>
          <SmartLink
            href={post.href}
            className='inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-stone-500 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200'>
            Read More
            <i className='fa-solid fa-angle-right align-middle'></i>
          </SmartLink>
        </div>
      </article>
    </div>
  )
}
