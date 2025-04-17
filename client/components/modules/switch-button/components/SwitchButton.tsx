// components/SwitchButton/SwitchButton.tsx
import React from 'react';
import { SwitchButtonBase } from './SwitchButtonBase';
import { SwitchButtonWithLabel } from './SwitchButtonWithLabel';
import { SwitchButtonProps, isSwitchButtonWithLabelProps } from '../types/switchButtonTypes';

/**
 * SwitchButton component that renders either a basic switch or a switch with label
 * based on the provided props.
 *
 * This serves as a bridge file to simplify usage and prevent boilerplate code.
 */
export const SwitchButton: React.FC<SwitchButtonProps> = (props) => {
  if (isSwitchButtonWithLabelProps(props)) {
    const { label, labelPlacement, ...switchProps } = props;
    return <SwitchButtonWithLabel label={label} labelPlacement={labelPlacement} {...switchProps} />;
  }

  return <SwitchButtonBase {...props} />;
};
