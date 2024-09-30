import { Route } from 'next';
import { IconType } from 'react-icons';

interface sideBarBase {
  IconComponent: IconType | string;
  name: string;
  type: 'dropDown' | 'link' | 'GroupNav';
  className?: string;
}

export interface linkTypeItem extends sideBarBase {
  type: 'link';
  link: Route<string>;
}

export interface dropDownItem extends sideBarBase {
  type: 'dropDown';
  childrenItem: { name: string; link: Route<string>; IconComponent: IconType | string }[];
}

export type GroupSideBarNavItem = {
  type: 'GroupNav';
  titleHeader: string;
  IconHeader: IconType | string;
  classHeader?: string;
  childrenHeader: Array<dropDownItem | linkTypeItem>;
};

export type SideBarNavItems = dropDownItem | linkTypeItem | GroupSideBarNavItem;
