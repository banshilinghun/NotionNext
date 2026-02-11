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

  return (
    <header className='relative z-10 bg-[#fbf8f3] dark:bg-black border-b border-[#e3dbcf] dark:border-gray-800'>
      <div className='mx-auto max-w-5xl px-6 py-10 md:py-14'>
        <div className='flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10'>
          <SmartLink href='/' className='shrink-0'>
            <div className='hover:scale-[1.02] transform duration-200 cursor-pointer flex items-center justify-center'>
              <LazyImage
                priority={true}
                src={siteInfo?.icon}
                className='rounded-full ring-4 ring-white dark:ring-gray-900 shadow-md'
                width={96}
                height={96}
                alt={siteConfig('AUTHOR')}
              />
            </div>
          </SmartLink>

          <div className='flex-1 text-center md:text-left'>
            <SmartLink href='/'>
              <h1 className='text-3xl md:text-5xl leading-tight tracking-tight text-[#2b241c] dark:text-white'>
                {siteConfig('TITLE')}
              </h1>
            </SmartLink>

            <div
              className='mt-2 text-[1.05rem] md:text-[1.15rem] text-[#5e5448] dark:text-gray-300 tracking-wide'
              dangerouslySetInnerHTML={{
                __html: siteConfig('SIMPLE_LOGO_DESCRIPTION', null, CONFIG)
              }}
            />

            <div className='mt-6 flex justify-center md:justify-start'>
              <SocialButton />
            </div>

            <p className='mt-4 text-sm md:text-[0.95rem] text-[#8a7f73] dark:text-gray-400 max-w-2xl leading-relaxed'>
              {siteConfig('DESCRIPTION')}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
