'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'next';
import { btnNavigation } from '@/shared/types/btn-navigation.model';
import { FaUser, FaUserCheck } from 'react-icons/fa6';
import styles from '../../../components/modules/tab-navigation/style/tab-navigaiton.module.scss';
import { usePathname } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

const tabs: btnNavigation[] = [
  { label: 'لیست', link: '/user/list', Icon: FaUser },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
];

const Userlayout = (props: Props) => {
  const pathName = usePathname();
  console.log(pathName);
  return (
    <>
      <nav className="flex h-[44px] w-fit items-center rounded-[10px] rounded-b-none border-b border-b-[#eeeeee] bg-[#fdfdfd] p-[5px_5px_0]">
        <ul className="m-0 flex w-fit list-none p-0 font-['Poppins'] text-[14px] font-medium">
          {tabs.map(({ Icon, ...item }) => (
            <Link
              href={item?.link as Route}
              key={item.label}
              className={`flex h-9 w-40 items-center justify-center rounded-t-lg text-slate-900 ${item.link === pathName ? 'bg-[#eee] text-lg text-secondary' : ''}`}
              // onClick={() => setSelectedTab(item)}
            >
              <Icon className="m-2" />
              {item.label}
              {item.link === pathName ? (
                <motion.div className={styles.underline} layoutId="underline" />
              ) : null}
            </Link>
          ))}
        </ul>
      </nav>
      <main className="flex h-[500px] grow select-none items-center justify-center rounded-b-lg border-b border-b-[#eeeeee] bg-[#fdfdfd] p-[5px_5px_0]">
        {props.children}
      </main>
    </>
  );
};

export default Userlayout;
