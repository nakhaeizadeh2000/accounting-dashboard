import React from 'react';
import { IconType } from 'react-icons';

type IconWrapperProps = {
  icon: IconType;
  ownerState?: any; // Explicitly define the `ownerState` prop
} & React.SVGProps<SVGSVGElement>;

const IconWrapper = ({ icon: Icon, ownerState, ...props }: IconWrapperProps) => {
  // Filter out the `ownerState` prop
  return <Icon {...props} />;
};

export default IconWrapper;