import { ReactElement } from 'react';
import SimpleButton from './SimpleButton';
import { ButtonBridgeProps, IconButtonProps, LoadingButtonProps, SimpleButtonProps } from '../types/ButtonTypes';
import IconButtonComponent from './IconButton';
import LoadingButtonComponent from './LoadingButton';

const ButtonBridge = ({ type, props }: ButtonBridgeProps): ReactElement => {
  switch (type) {
    case 'simple':
      return <SimpleButton {...(props as SimpleButtonProps)} />;
    case 'icon':
      return <IconButtonComponent {...(props as IconButtonProps)} />;
    case 'loading':
      return <LoadingButtonComponent {...(props as LoadingButtonProps)} />;
    default:
      return <SimpleButton {...(props as SimpleButtonProps)} />;
  }
};

export default ButtonBridge;