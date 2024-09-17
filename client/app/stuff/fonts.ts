import localFont from 'next/font/local';

export const yekanBakh = localFont({
  src: [
    {
      path: '../../public/fonts/woff2/YekanBakh-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/woff2/YekanBakh-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/woff2/YekanBakh-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-yekan-bakh',
  display: 'swap',
});
