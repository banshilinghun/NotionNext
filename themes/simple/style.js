/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Serif:wght@400;600&display=swap');

  #theme-simple {
    font-family: 'IBM Plex Sans', 'Noto Sans', sans-serif;
  }

  #theme-simple h1,
  #theme-simple h2,
  #theme-simple h3,
  #theme-simple .blog-item-title {
    font-family: 'IBM Plex Serif', 'Noto Serif', serif;
  }

  // 底色
  .dark body{
      background-color: black;
  }
  // 文本不可选取
    .forbid-copy {
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }
  
  #theme-simple #announcement-content {
    /* background-color: #f6f6f6; */
  }
  
  #theme-simple .blog-item-title {
    color: #111827;
  }
  
  .dark #theme-simple .blog-item-title {
    color: #d1d5db;
  }
  
  .notion {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  
  
  /*  菜单下划线动画 */
  #theme-simple .menu-link {
      text-decoration: none;
      background-image: linear-gradient(#111827, #111827);
      background-repeat: no-repeat;
      background-position: bottom center;
      background-size: 0 2px;
      transition: background-size 120ms ease-in-out, color 120ms ease-in-out;
  }
   
  #theme-simple .menu-link:hover {
      background-size: 100% 2px;
      color: #111827;
      cursor: pointer;
  }
  
  

  `}</style>
}

export { Style }
