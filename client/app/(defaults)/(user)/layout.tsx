'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'next';

type Props = {
  children: React.ReactNode;
};

const tabs = [
  { label: 'لیست', link: '/userList' },
  { label: 'جدید', link: '/userAdd' },
];

const Userlayout = (props: Props) => {
  // const [selectedTab, setSelectedTab] = useState(tabs[0]);
  return (
    <>
      <span>hello im layout user module </span>
      <nav className="h-[44px] rounded-[10px] rounded-b-none border-b border-b-[#eeeeee] bg-[#fdfdfd] p-[5px_5px_0]">
        <ul>
          {tabs.map((item) => (
            <Link
              href={item?.link as Route}
              key={item.label}
              className="text-slate-700"
              // onClick={() => setSelectedTab(item)}
            >
              {` ${item.label}`}
              {/* {item === selectedTab ? (
                <motion.div className="underline" layoutId="underline" />
              ) : null} */}
            </Link>
          ))}
        </ul>
      </nav>
      <main className="flex grow select-none items-center justify-center">{props.children}</main>
    </>
  );
};

export default Userlayout;
