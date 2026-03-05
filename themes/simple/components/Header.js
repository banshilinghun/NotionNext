import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import SocialButton from './SocialButton'

/**
 * 网站顶部
 * @returns
 */
export default function Header(props) {
  const { siteInfo } = props

  // Make the top area more "website-like": compact, sticky, and clean.
  // The homepage already has a hero section; this header acts as a consistent nav anchor.
  return (
    <header className='sticky top-0 z-30 bg-[#fbf8f3]/85 dark:bg-black/70 backdrop-blur border-b border-[#e3dbcf] dark:border-gray-800'>
      <div className='mx-auto max-w-5xl px-6 py-4'>
        <div className='flex items-center justify-between gap-4'>
          <SmartLink href='/' className='shrink-0 no-underline'>
            <div className='flex items-center gap-3 hover:opacity-95 transition-opacity'>
              <LazyImage
                priority={true}
                src={siteInfo?.icon}
                className='rounded-full ring-2 ring-white/80 dark:ring-gray-900 shadow-sm'
                width={38}
                height={38}
                alt={siteConfig('AUTHOR')}
              />
              <div className='leading-tight'>
                <div className='text-[1.05rem] font-semibold text-[#2b241c] dark:text-white'>
                  {siteConfig('TITLE')}
                </div>
                <div className='hidden md:block text-xs text-[#8a7f73] dark:text-gray-400'>
                  {siteConfig('DESCRIPTION')}
                </div>
              </div>
            </div>
          </SmartLink>

          {/* Keep the header clean; social links can live in footer/sidebar. */}
          <div className='hidden md:flex items-center gap-2'>
            <SocialButton />
          </div>
        </div>
      </div>
    </header>
  )
}

