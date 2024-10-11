import { Route } from 'next';
import { IconType } from 'react-icons';

export interface btnNavigationBase {
  label: string;
  Icon: IconType;
  className?: string;
  visibleCondition?: boolean;
  disableCondition?: boolean;
}

export interface btnLinkNavigation extends btnNavigationBase {
  type: 'link';
  link: Route<string>; // just route , don't url because this is for navigation the component
}
export interface btnDropDownNavigation extends btnNavigationBase {
  type: 'dropDown';
  children: btnLinkNavigation[];
}

export type BtnNavigation = btnDropDownNavigation | btnLinkNavigation;
