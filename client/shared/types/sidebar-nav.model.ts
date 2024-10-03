import { Route } from 'next';
import { IconType } from 'react-icons';
import { Url } from 'url';

interface sideBarBase {
  IconComponent: IconType | string;
  name: string;
  type: 'dropDown' | 'link' | 'GroupNav';
  className?: string;
}

export interface linkTypeItem extends sideBarBase {
  type: 'link';
  link: Route<string> | Url;
}

export interface dropDownItem extends sideBarBase {
  type: 'dropDown';
  childrenItem: { name: string; link: Route<string> | Url; IconComponent: IconType | string }[];
}

export type GroupSideBarNavItem = {
  type: 'GroupNav';
  titleHeader: string;
  IconHeader: IconType | string;
  classHeader?: string;
  childrenHeader: Array<dropDownItem | linkTypeItem>;
};

export type SideBarNavItems = dropDownItem | linkTypeItem | GroupSideBarNavItem;
