import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

export const BlogItem = props => {
  const { post, featured = false } = props
  const { NOTION_CONFIG } = useGlobal()
  const showPageCover = siteConfig('SIMPLE_POST_COVER_ENABLE', false, CONFIG)
  const showPreview =
    siteConfig('POST_LIST_PREVIEW', false, NOTION_CONFIG) && post.blockMap

  return (
    <div
      key={post.id}
      className={`h-full rounded-2xl border border-stone-200/80 dark:border-gray-800 bg-[#fffdf9] dark:bg-black/60 shadow-[0_1px_6px_rgba(62,45,25,0.08)] hover:shadow-[0_8px_24px_rgba(62,45,25,0.14)] transition-shadow duration-300 ${featured ? 'md:rounded-3xl' : ''}`}>
      {/* 封面图 */}
      {showPageCover && (
        <SmartLink href={post.href} passHref legacyBehavior>
          <div className={`overflow-hidden ${featured ? 'rounded-t-3xl' : 'rounded-t-2xl'}`}>
            <LazyImage
              src={post?.pageCoverThumbnail}
              className={`w-full object-cover object-center hover:scale-[1.015] duration-500 ${featured ? 'aspect-[18/8]' : 'aspect-[16/9]'}`}
            />
          </div>
        </SmartLink>
      )}

      <article className={`${featured ? 'p-6 md:p-8' : 'p-5 md:p-6'}`}>
        <h2 className='mb-4'>
          <SmartLink
            href={post.href}
            className={`blog-item-title text-[#2b241c] dark:text-white leading-tight ${featured ? 'text-[1.65rem] md:text-[2rem]' : 'text-[1.35rem] md:text-[1.6rem]'}`}>
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post.pageIcon} />
            )}
            {post.title}
          </SmartLink>
        </h2>

        {/* 文章信息 */}
        <header className='mb-4 text-xs md:text-sm text-[#8a7f73] dark:text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-2'>
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

        <main className={`text-[#5e5448] dark:text-gray-300 leading-[1.85] ${featured ? 'text-[1.02rem] mb-7' : 'text-[0.95rem] mb-6'}`}>
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
            className='inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#6d8a57] dark:text-gray-300 hover:text-[#5b7547] dark:hover:text-white transition-colors duration-200'>
            Read More
            <i className='fa-solid fa-angle-right align-middle'></i>
          </SmartLink>
        </div>
      </article>
    </div>
  )
}
