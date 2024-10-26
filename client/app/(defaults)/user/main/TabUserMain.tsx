'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import BtnNavigationComponent from '@/components/modules/tab-navigation/BtnNavigationComponent';

import { btnNavigation } from '@/components/modules/tab-navigation/btn-navigation.model';
import { useParams, usePathname } from 'next/navigation';
import { BsArrowReturnRight } from 'react-icons/bs';
import { FiEdit3 } from 'react-icons/fi';
import { Route } from 'next';
import { FaUser } from 'react-icons/fa6';

export type Props = {
  children: ReactNode;
};

const TabUserMain = ({ children }: Props) => {
  const path = usePathname();

  const [currentTab, setCurrentTab] = useState<number>();

  useEffect(() => {
    btnMain.map((item, index) => {
      if (item.link === path) {
        setCurrentTab(index);
      }
    });
  }, [path]);

  const btnMain: btnNavigation[] = [
    {
      label: 'لیست',
      Icon: FaUser,
      link: '/user/main/list',
    },
    {
      label: 'جدید',
      Icon: FiEdit3,
      link: '/user/main/add',
    },
  ];

  return (
    <BtnNavigationComponent currentTab={currentTab} btn={btnMain}>
      {children}
    </BtnNavigationComponent>
  );
};

export default TabUserMain;
