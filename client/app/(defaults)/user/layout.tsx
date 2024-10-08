'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Route } from 'next';
import { FaChevronLeft, FaChevronRight, FaUser, FaUserCheck } from 'react-icons/fa6';
import { btnNavigation } from '@/shared/types/btn-navigation.model';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box } from '@mui/material';
import UserListComponent from './list/page';
import UserAddComponent from './add/page';

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
  { label: '1جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '2جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '3جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '4جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '5جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '6جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '7جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '8جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '9جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '10جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '11جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '12جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '13جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '14جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '15جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '16جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '17جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '18جدید', link: '/user/add', Icon: FaUserCheck },
  { label: '19جدید', link: '/user/add', Icon: FaUserCheck },
];

const Userlayout = (props: Props) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      {/* Tabs navigation */}

      <Tabs
        value={currentTab}
        onChange={handleChange}
        aria-label="User Tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.length > 0 &&
          tabs.map(({ Icon, ...item }) => (
            <Tab
              key={item?.label}
              label={item?.label}
              component={Link}
              href={item?.link as Route}
              // icon={<Icon />}
              iconPosition="start"
            />
          ))}
      </Tabs>

      {/* Conditionally render components based on the selected tab */}
      <Box sx={{ padding: '20px', borderTop: '1px solid #e0e0e0' }}>{props.children}</Box>
    </Box>
  );
  // const pathName = usePathname();

  // return (
  //   <>

  //     <main className="flex h-[500px] grow select-none items-center justify-center rounded-sm border-b border-b-[#eeeeee] bg-[#fdfdfd] p-[5px_5px_0]">
  //       {props.children}
  //     </main>
  //   </>
  // );
};

export default Userlayout;
