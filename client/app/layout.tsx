import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { yekanBakh } from './stuff/fonts';
import { Metadata } from 'next';
import { FontAwesome } from './stuff/fontawesome';

export const metadata: Metadata = {
  title: {
    template: '%s | red-desert-company-dashboard - Multipurpose Tailwind Dashboard Template',
    default: 'red-desert-company-dashboard - Multipurpose Tailwind Dashboard Template',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" className={`${yekanBakh.variable} font-sans`}>
      <head>
        <link
          rel="preload"
          href="/fontAwesome-v6.1.2/webfonts/fa-light-300.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <FontAwesome />
        <ProviderComponent>{children}</ProviderComponent>
      </body>
    </html>
  );
}
