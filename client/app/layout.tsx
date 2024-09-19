import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { yekanBakh } from './stuff/fonts';
import { Metadata } from 'next';


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
      </head>
      <body>
        <ProviderComponent>{children}</ProviderComponent>
      </body>
    </html>
  );
}
