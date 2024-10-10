'use client';
import React from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import createRtlCache from '@/utils/mui-config/createRtlCache';
import theme from '@/utils/mui-config/theme-mui';

type Props = {
  children: React.ReactNode;
};
const rtlCache = createRtlCache();
const ProviderMuiConfig = (props: Props) => {
  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </CacheProvider>
  );
};

export default ProviderMuiConfig;
