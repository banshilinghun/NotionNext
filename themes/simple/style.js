/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
  @import url('https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify,Latin&display=swap');
  @import url('https://cdn-font.hyperos.mi.com/font/css?family=MiSans:100,200,300,400,450,500,600,650,700,900:Chinese_Simplify,Latin&display=swap');

  #theme-simple {
    font-family: 'MiSans VF', 'MiSans', 'PingFang SC', sans-serif;
    --sn-bg-page: #f7f3ec;
    --sn-bg-section: #fbf8f3;
    --sn-bg-card: #fffdf9;
    --sn-text-title: #2b241c;
    --sn-text-body: #5e5448;
    --sn-text-muted: #8a7f73;
    --sn-line: #e3dbcf;
    --sn-accent: #6d8a57;
    --sn-accent-hover: #5b7547;
  }

  #theme-simple h1,
  #theme-simple h2,
  #theme-simple h3,
  #theme-simple .blog-item-title {
    font-family: 'MiSans VF', 'MiSans', 'PingFang SC', sans-serif;
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
    color: var(--sn-text-title);
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
      background-image: linear-gradient(var(--sn-accent), var(--sn-accent));
      background-repeat: no-repeat;
      background-position: bottom center;
      background-size: 0 2px;
      transition: background-size 120ms ease-in-out, color 120ms ease-in-out;
  }
   
  #theme-simple .menu-link:hover {
      background-size: 100% 2px;
      color: var(--sn-accent-hover);
      cursor: pointer;
  }
  
  

  `}</style>
}

export { Style }
