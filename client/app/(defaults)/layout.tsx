import CheckAuth from '@/components/auth/CheckAuth';
import ContentAnimation from '@/components/layouts/content-animation';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';
import MainContainer from '@/components/layouts/main-container';
import Overlay from '@/components/layouts/overlay';
import ScrollToTop from '@/components/layouts/scroll-to-top';
import Setting from '@/components/layouts/setting';
import Sidebar from '@/components/layouts/sidebar';
import Portals from '@/components/portals';
import React from 'react';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CheckAuth>
        {/* BEGIN MAIN CONTAINER */}
        <div className="relative">
          <Overlay />
          <ScrollToTop />

          {/* BEGIN APP SETTING LAUNCHER */}
          <Setting />
          {/* END APP SETTING LAUNCHER */}

          <MainContainer>
            {/* BEGIN SIDEBAR */}
            <Sidebar />
            {/* END SIDEBAR */}
            <div className="main-content flex min-h-screen flex-col">
              {/* BEGIN TOP NAVBAR */}
              <Header />
              {/* END TOP NAVBAR */}

              {/* BEGIN CONTENT AREA */}
              <ContentAnimation className="p-6">{children}</ContentAnimation>
              {/* END CONTENT AREA */}

              {/* BEGIN FOOTER */}
              <Footer />
              {/* END FOOTER */}
              <Portals />
            </div>
          </MainContainer>
        </div>
      </CheckAuth>
    </>
  );
}
