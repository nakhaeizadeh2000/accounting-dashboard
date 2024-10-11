'use client';

import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box } from '@mui/material';
import Link from 'next/link';
import { Route } from 'next';
import { BtnNavigation } from './btn-navigation.model';

type Props = {
  btn: BtnNavigation[];
  children: React.ReactNode;
};

const BtnNavigationComponent = ({ btn, children }: Props) => {
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
        aria-label="scrollable force tabs example"
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: {
            backgroundColor: '#793ac1',
          },
        }}
      >
        {btn.length > 0 &&
          btn.map(({ Icon, ...item }) => (
            <Tab
              key={item?.label}
              label={item?.label}
              component={Link}
              href={item?.type === 'link' ? (item?.link as Route) : '/'}
              icon={<Icon />}
              iconPosition="start"
              disabled={item?.disableCondition}
            />
          ))}
      </Tabs>

      {/* Conditionally render components based on the selected tab */}
      <Box sx={{ padding: '20px', borderTop: '1px solid #e0e0e0' }}>{children}</Box>
    </Box>
  );
};

export default BtnNavigationComponent;
