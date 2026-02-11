import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useSimpleGlobal } from '..'
import { MenuList } from './MenuList'

/**
 * 菜单导航
 * @param {*} props
 * @returns
 */
export default function NavBar(props) {
  const [showSearchInput, changeShowSearchInput] = useState(false)
  const router = useRouter()
  const { searchModal } = useSimpleGlobal()

  // 展示搜索框
  const toggleShowSearchInput = () => {
    if (siteConfig('ALGOLIA_APP_ID')) {
      searchModal.current.openSearch()
    } else {
      changeShowSearchInput(!showSearchInput)
    }
  }

  const onKeyUp = e => {
    if (e.keyCode === 13) {
      const search = document.getElementById('simple-search').value
      if (search) {
        router.push({ pathname: '/search/' + search })
      }
    }
  }

  return (
    <nav className='w-full bg-[#fbf8f3]/80 backdrop-blur supports-[backdrop-filter]:bg-[#fbf8f3]/70 relative z-20 border-t border-[#e3dbcf] dark:border-hexo-black-gray dark:bg-black'>
      <div
        id='nav-bar-inner'
        className='h-11 mx-auto max-w-5xl justify-between items-center text-xs md:text-sm md:justify-start'>
        {/* 左侧菜单 */}
        <div className='h-full w-full float-left text-center md:text-left flex flex-wrap items-stretch md:justify-start md:items-center gap-x-4 gap-y-1'>
          {showSearchInput && (
            <input
              autoFocus
              id='simple-search'
              onKeyUp={onKeyUp}
              className='float-left w-full outline-none h-full px-4'
              aria-label='Submit search'
              type='search'
              name='s'
              autoComplete='off'
              placeholder='Type then hit enter to search...'
            />
          )}
          {!showSearchInput && <MenuList {...props} />}
        </div>

        <div className='absolute right-6 h-full text-center px-2 flex items-center text-[#8a7f73] hover:text-[#2b241c] cursor-pointer'>
          {/* <!-- extra links --> */}
          <i
            className={
              showSearchInput
                ? 'fa-regular fa-circle-xmark'
                : 'fa-solid fa-magnifying-glass' + ' align-middle'
            }
            onClick={toggleShowSearchInput}></i>
        </div>
      </div>
    </nav>
  )
}
