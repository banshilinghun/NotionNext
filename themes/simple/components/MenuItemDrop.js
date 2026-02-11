import SmartLink from '@/components/SmartLink'
import { useState } from 'react'

export const MenuItemDrop = ({ link }) => {
  const [show, changeShow] = useState(false)
  const hasSubMenu = link?.subMenus?.length > 0

  if (!link || !link.show) {
    return null
  }

  return (
    <div
      onMouseOver={() => changeShow(true)}
      onMouseOut={() => changeShow(false)}>
      {!hasSubMenu && (
        <SmartLink
          href={link?.href}
          target={link?.target}
          className='menu-link px-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white no-underline tracking-wide pb-1 transition-colors duration-200'>
          {link?.icon && (
            <span className='mr-1.5 text-[0.7rem]'>
              <i className={link.icon} />
            </span>
          )}
          {link?.name}
          {hasSubMenu && <i className='px-2 fa fa-angle-down'></i>}
        </SmartLink>
      )}

      {hasSubMenu && (
        <>
          <div className='cursor-pointer menu-link px-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white no-underline tracking-wide pb-1 transition-colors duration-200'>
            {link?.icon && (
              <span className='mr-1.5 text-[0.7rem]'>
                <i className={link.icon} />
              </span>
            )}{' '}
            {link?.name}
            <i
              className={`px-2 fas fa-chevron-down duration-500 transition-all ${show ? ' rotate-180' : ''}`}></i>
          </div>
        </>
      )}

      {/* 子菜单 */}
      {hasSubMenu && (
        <ul
          className={`${show ? 'visible opacity-100 top-12' : 'invisible opacity-0 top-10'} border-gray-100  bg-white  dark:bg-black dark:border-gray-800 transition-all duration-300 z-20 absolute block drop-shadow-lg `}>
          {link.subMenus.map((sLink, index) => {
            return (
              <li
                key={index}
                className='not:last-child:border-b-0 border-b text-blue-600 dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-900 tracking-widest transition-all duration-200 dark:border-gray-800  py-3 pr-6 pl-2'>
                <SmartLink href={sLink.href} target={link?.target}>
                  <span className='text-sm text-nowrap'>
                    {sLink?.icon && <i className={sLink?.icon}> &nbsp; </i>}
                    {sLink.title}
                  </span>
                </SmartLink>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
