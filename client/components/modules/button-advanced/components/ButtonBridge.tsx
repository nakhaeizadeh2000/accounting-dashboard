import { forwardRef, ReactElement } from 'react';
import SimpleButton from './SimpleButton';
import IconButton from './IconButton';
import LoadingButton from './LoadingButton';
import AdvancedButton from './AdvancedButton';
import {
  ButtonBridgeProps,
  IconButtonProps,
  LoadingButtonProps,
  SimpleButtonProps,
  AdvancedButtonProps,
} from '../types/types';

const ButtonBridge = forwardRef<HTMLButtonElement, ButtonBridgeProps>(
  ({ type, props }: ButtonBridgeProps, ref): ReactElement => {
    switch (type) {
      case 'simple':
        return <SimpleButton ref={ref} {...(props as SimpleButtonProps)} />;
      case 'icon':
        return <IconButton ref={ref} {...(props as IconButtonProps)} />;
      case 'loading':
        return <LoadingButton ref={ref} {...(props as LoadingButtonProps)} />;
      case 'advanced':
        return <AdvancedButton ref={ref} {...(props as AdvancedButtonProps)} />;
      default:
        return <SimpleButton ref={ref} {...(props as SimpleButtonProps)} />;
    }
  },
);

ButtonBridge.displayName = 'ButtonBridge';

export default ButtonBridge;
