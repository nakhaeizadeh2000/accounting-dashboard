// components/SwitchButton/SwitchButtonBase.tsx
import React from 'react';
import { SwitchButtonBaseProps } from '../types/switchButtonTypes';
import { MaterialStyle } from '../styles/MaterialStyle';
import { IOSStyle } from '../styles/IosStyle';
import { AndroidStyle } from '../styles/AndroidStyle';

export const SwitchButtonBase: React.FC<SwitchButtonBaseProps> = (props) => {
  const { switchStyle = 'ios', ...restProps } = props;

  // Select the appropriate style component based on the switchStyle prop
  switch (switchStyle) {
    case 'ios':
      return <IOSStyle {...restProps} />;
    case 'android':
      return <AndroidStyle {...restProps} />;
    case 'material':
      return <MaterialStyle {...restProps} />;
  }
};
