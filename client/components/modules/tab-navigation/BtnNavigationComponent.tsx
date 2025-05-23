'use client';

import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box } from '@mui/material';
import Link from 'next/link';
import { Route } from 'next';
import { btnNavigation } from './btn-navigation.model';
import { usePathname } from 'next/navigation';
import { values } from 'lodash';

type Props = {
  btn: btnNavigation[];
  children: React.ReactNode;
  setUserId?: () => void;
  currentTab?: number;
  bodyBgColor?: string;
  bodyPadding?: string;
};

const BtnNavigationComponent = ({
  currentTab,
  btn,
  children,
  bodyBgColor = 'background.default',
  bodyPadding = '20px',
}: Props) => {
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // setCurrentTab(newValue);
    // console.log(newValue, 'new value');
  };
  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      {/* Tabs navigation */}

      <Tabs
        value={currentTab ?? false}
        onChange={handleChange}
        aria-label="scrollable force tabs example"
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: {
            backgroundColor: '#6571ff',
            color: '#6571ff',
          },
        }}
      >
        {btn.length > 0 &&
          btn.map(({ Icon, ...item }) => (
            <Tab
              key={item?.label}
              label={item?.label}
              component={Link}
              href={item?.link as Route}
              icon={<Icon />}
              iconPosition="start"
              disabled={item?.disableCondition}
            />
          ))}
      </Tabs>

      {/* Conditionally render components based on the selected tab */}
      <Box
        sx={{
          padding: bodyPadding,
          //TODO set color dynamic when i choose the mode theme
          borderTop: '1px solid #e0e0e0',
          minHeight: '600px',
          bgcolor: bodyBgColor,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default BtnNavigationComponent;

// import React from 'react';
// import { Tabs, Tab, Menu, MenuItem, Box } from '@mui/material';

// const UsersLayout: React.FC = () => {
//   const [selectedTab, setSelectedTab] = React.useState<number | false>(0);  // Keeps track of active tab
//   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null); // Anchor for dropdown

//   // Handle Tab change except for the "More" Tab
//   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//     if (newValue !== 2) {
//       setSelectedTab(newValue);  // Change tab only for non-dropdown tabs
//     }
//   };

//   // Open dropdown for the "More" tab
//   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedTab(false); // Keep selected tab disabled since this is a dropdown
//   };

//   // Close dropdown
//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <Box sx={{ width: '100%' }}>
//       {/* Tabs with one dropdown */}
//       <Tabs value={selectedTab} onChange={handleChange} aria-label="User Tabs">
//         <Tab label="لیست کاربران" />
//         <Tab label="افزودن کاربر" />
//         <Tab
//           label="بیشتر"
//           onClick={handleClick}  // Trigger dropdown on click
//         />
//       </Tabs>

//       {/* Dropdown for the "More" Tab */}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleClose}
//         MenuListProps={{
//           'aria-labelledby': 'more-tab',
//         }}
//       >
//         <MenuItem onClick={handleClose}>ویرایش کاربر</MenuItem>
//         <MenuItem onClick={handleClose}>حذف کاربر</MenuItem>
//       </Menu>
//     </Box>
//   );
// };

// export default UsersLayout;
