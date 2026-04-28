import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import { siteConfig } from '@/lib/config'
import { formatDateFmt } from '@/lib/utils/formatDate'
import NotionIcon from '@/components/NotionIcon'
import LazyImage from '@/components/LazyImage'
import { getPostCover } from '@/lib/post-cover'

/**
 * 文章描述
 * @param {*} props
 * @returns
 */
export default function ArticleInfo(props) {
  const { post } = props
  const { locale } = useGlobal()
  const cover = getPostCover(post)
  const tags = Array.isArray(post?.tags) ? post.tags : []

  return (
    <section className='mt-2 text-[#5e5448] dark:text-gray-300 leading-7'>
      <div className='mb-6 overflow-hidden rounded-[2rem] border border-stone-200/80 bg-[#fffdf9] shadow-[0_8px_30px_rgba(62,45,25,0.12)] dark:border-gray-800 dark:bg-black/50'>
        <LazyImage
          src={cover}
          className='aspect-[16/9] w-full object-cover object-center'
        />
      </div>

      <h2 className='blog-item-title mb-4 font-bold text-[#2b241c] dark:text-white text-xl md:text-2xl no-underline leading-tight'>
        {siteConfig('POST_TITLE_ICON') && <NotionIcon icon={post?.pageIcon} />}
        {post?.title}
      </h2>

      {post?.type !== 'Page' && (
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-xs md:text-sm text-[#8a7f73] dark:text-gray-300'>
          <span className='inline-flex items-center gap-1'>
            <i className='fa-regular fa-user' />
            <a
              className='hover:text-[#2b241c] dark:hover:text-white transition-colors'
              href={siteConfig('SIMPLE_AUTHOR_LINK', null, CONFIG)}>
              {siteConfig('AUTHOR')}
            </a>
          </span>

          <SmartLink
            className='inline-flex items-center gap-1 hover:text-[#2b241c] dark:hover:text-white transition-colors'
            href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}>
            <i className='fa-regular fa-clock' />
            {post?.publishDay}
          </SmartLink>

          {post?.category && (
            <SmartLink
              href={`/category/${post?.category}`}
              className='inline-flex items-center gap-1 hover:text-[#2b241c] dark:hover:text-white transition-colors'>
              <i className='fa-regular fa-folder' />
              {post?.category}
            </SmartLink>
          )}

          {tags.length > 0 && (
            <span className='inline-flex items-center gap-2 flex-wrap'>
              <i className='fa-solid fa-hashtag opacity-70' />
              {tags.map(t => (
                <SmartLink
                  key={t}
                  href={`/tag/${t}`}
                  className='no-underline px-2 py-1 rounded-full border border-stone-200/80 dark:border-gray-800 bg-[#fffdf9]/70 dark:bg-black/40 hover:text-[#2b241c] dark:hover:text-white transition-colors'>
                  {t}
                </SmartLink>
              ))}
            </span>
          )}

          <span className='mx-1 opacity-50'>·</span>
          <span className='dark:text-gray-500'>
            {locale.COMMON.LAST_EDITED_TIME}: {post?.lastEditedDay}
          </span>

          <span className='hidden busuanzi_container_page_pv font-light'>
            <i className='mr-1 fas fa-eye' />
            <span className='busuanzi_value_page_pv' />
          </span>
        </div>
      )}
    </section>
  )
}
