'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'next';
import { btnNavigation } from '@/shared/types/btn-navigation.model';
import { FaUser, FaUserCheck } from 'react-icons/fa6';
// import styles from './tab-navigaiton.module.scss';
import { usePathname } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

const tabVariants = {
  active: {
    backgroundColor: '#eee',
    color: '#8855ff',
    transition: { duration: 0.3 },
  },
  inactive: {
    backgroundColor: 'transparent',
    color: '#1e293b',
    transition: { duration: 0.3 },
  },
};

const underlineVariants = {
  active: {
    width: '100%',
    transition: { duration: 0.3 },
  },
  inactive: {
    width: '0%',
    transition: { duration: 0.3 },
  },
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
      <nav className="relative right-2 flex h-[44px] w-fit items-center rounded-lg rounded-b-none border-b border-b-[#eeeeee] bg-[#fdfdfd]">
        <ul className="m-0 flex h-[100%] w-fit list-none p-0 font-['Poppins'] text-[14px] font-medium">
          {tabs.map(({ Icon, ...item }) => (
            <motion.li
              key={item.label}
              variants={tabVariants}
              animate={item.link === pathName ? 'active' : 'inactive'}
              className={`relative h-[100%] rounded-t-lg`}
              whileHover={item?.link !== pathName ? { scale: 0.9 } : { scale: 1 }}
            >
              <Link
                href={item?.link as Route}
                className={`flex h-[100%] w-40 items-center justify-center`}
              >
                <Icon className="m-2" />
                {item.label}
              </Link>
              {item.link === pathName && (
                <motion.div
                  className="absolute h-[1px] w-40 bg-[#8855ff]"
                  layoutId="underline"
                  variants={underlineVariants}
                  animate={item.link === pathName ? 'active' : 'inactive'}
                />
              )}
            </motion.li>
          ))}
        </ul>
      </nav>
      <main className="flex h-[500px] grow select-none items-center justify-center rounded-sm border-b border-b-[#eeeeee] bg-[#fdfdfd] p-[5px_5px_0]">
        {props.children}
      </main>
    </>
  );
};

export default Userlayout;
