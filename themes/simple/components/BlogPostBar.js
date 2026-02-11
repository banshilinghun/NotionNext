import { useGlobal } from '@/lib/global'

/**
 * 文章列表上方嵌入
 * @param {*} props
 * @returns
 */
export default function BlogPostBar(props) {
  const { tag, category } = props
  const { locale } = useGlobal()

  if (tag) {
    return (
      <div className='flex items-center text-2xl md:text-3xl font-serif py-1 mb-6 text-gray-900'>
        <i className='mr-3 fas fa-tag text-lg' />
        {locale.COMMON.TAGS}: {tag}
      </div>
    )
  } else if (category) {
    return (
      <div className='flex items-center text-2xl md:text-3xl font-serif py-1 mb-6 text-gray-900'>
        <i className='mr-3 fas fa-th text-lg' />
        {locale.COMMON.CATEGORY}: {category}
      </div>
    )
  } else {
    return <></>
  }
}
