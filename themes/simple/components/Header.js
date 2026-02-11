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
    <header className='relative z-10 bg-[#fbfbf7] dark:bg-black border-b border-gray-200/70 dark:border-gray-800'>
      <div className='mx-auto max-w-5xl px-6 py-14 md:py-20'>
        <div className='flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12'>
          <SmartLink href='/' className='shrink-0'>
            <div className='hover:scale-[1.02] transform duration-200 cursor-pointer flex items-center justify-center'>
              <LazyImage
                priority={true}
                src={siteInfo?.icon}
                className='rounded-full ring-4 ring-white dark:ring-gray-900 shadow-md'
                width={128}
                height={128}
                alt={siteConfig('AUTHOR')}
              />
            </div>
          </SmartLink>

          <div className='flex-1 text-center md:text-left'>
            <SmartLink href='/'>
              <h1 className='text-4xl md:text-6xl leading-tight tracking-tight text-gray-900 dark:text-white'>
                {siteConfig('TITLE')}
              </h1>
            </SmartLink>

            <div
              className='mt-3 text-base md:text-lg text-gray-600 dark:text-gray-300 tracking-wide'
              dangerouslySetInnerHTML={{
                __html: siteConfig('SIMPLE_LOGO_DESCRIPTION', null, CONFIG)
              }}
            />

            <div className='mt-6 flex justify-center md:justify-start'>
              <SocialButton />
            </div>

            <p className='mt-6 text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed'>
              {siteConfig('DESCRIPTION')}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
