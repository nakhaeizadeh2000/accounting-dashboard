'use client';
import React from 'react';
import BtnNavigationComponent from '@/components/modules/tab-navigation/BtnNavigationComponent';
import { btnTabs } from './TabsUser';

type Props = {
  children: React.ReactNode;
};

const Userlayout = (props: Props) => {
  return <BtnNavigationComponent btn={btnTabs}>{props.children}</BtnNavigationComponent>;
};

export default Userlayout;
