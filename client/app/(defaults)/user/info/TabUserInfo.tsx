'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import BtnNavigationComponent from '@/components/modules/tab-navigation/BtnNavigationComponent';

import { btnNavigation } from '@/components/modules/tab-navigation/btn-navigation.model';
import { useParams, usePathname } from 'next/navigation';
import { BsArrowReturnRight } from 'react-icons/bs';
import { FiEdit3 } from 'react-icons/fi';
import { Route } from 'next';

export type Props = {
  children: ReactNode;
};

const TabUserInfo = ({ children }: Props) => {
  const param = useParams<{ userId: string }>();

  const path = usePathname();

  const [currentTab, setCurrentTab] = useState<number>();

  useEffect(() => {
    btnInfo.map((item, index) => {
      if (item.link === path) {
        setCurrentTab(index);
      }
    });
  }, [path]);

  const btnInfo: btnNavigation[] = [
    {
      label: 'بازگشت به لیست',
      Icon: BsArrowReturnRight,
      link: '/user/main/list',
    },
    {
      label: 'ویرایش',
      Icon: FiEdit3,
      link: ('/user/info/' + param.userId) as Route,
    },
  ];

  console.log(currentTab);

  return (
    <BtnNavigationComponent currentTab={currentTab} btn={btnInfo}>
      {children}
    </BtnNavigationComponent>
  );
};

export default TabUserInfo;
