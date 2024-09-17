'use client';
import { IRootState } from '@/store';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ContentAnimation = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const [animation, setAnimation] = useState(themeConfig.animation);

  useEffect(() => {
    setAnimation(themeConfig.animation);
  }, [themeConfig.animation]);

  useEffect(() => {
    setAnimation(themeConfig.animation);
    setTimeout(() => {
      setAnimation('');
    }, 1100);
  }, [pathname]);
  return (
    <>
      {/* BEGIN CONTENT AREA */}
      <div className={`${animation} animate__animated ` + className}>{children}</div>
      {/* END CONTENT AREA */}
    </>
  );
};

export default ContentAnimation;
