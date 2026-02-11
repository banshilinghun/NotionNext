import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import TwikooCommentCount from '@/components/TwikooCommentCount'
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
      className='h-full rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-black/60 shadow-[0_1px_8px_rgba(17,24,39,0.06)] hover:shadow-[0_6px_18px_rgba(17,24,39,0.12)] transition-shadow duration-200'>
      {/* 封面图 */}
      {showPageCover && (
        <SmartLink href={post.href} passHref legacyBehavior>
          <div className='overflow-hidden rounded-t-2xl'>
            <LazyImage
              src={post?.pageCoverThumbnail}
              className='w-full h-52 object-cover object-center hover:scale-[1.02] duration-500'
            />
          </div>
        </SmartLink>
      )}

      <article className='p-6'>
        <h2 className='mb-3'>
          <SmartLink
            href={post.href}
            className='blog-item-title text-gray-900 dark:text-white text-2xl md:text-3xl leading-tight'>
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post.pageIcon} />
            )}
            {post.title}
          </SmartLink>
        </h2>

        {/* 文章信息 */}
        <header className='mb-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-1'>
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
          <TwikooCommentCount post={post} />
          {post.category && (
            <SmartLink href={`/category/${post.category}`} className='inline-flex items-center gap-1'>
              <i className='fa-regular fa-folder' />
              {post.category}
            </SmartLink>
          )}
        </header>

        <main className='text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-[0.95rem]'>
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
            className='inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200'>
            Continue Reading
            <i className='fa-solid fa-angle-right align-middle'></i>
          </SmartLink>
        </div>
      </article>
    </div>
  )
}
