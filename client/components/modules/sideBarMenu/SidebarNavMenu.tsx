import { SideBarNavItems } from '@/shared/types/sidebar-nav.model';
import React from 'react';
import DropDownSidebarMenu from './DropDownSidebarMenu';
import LinkSidebarMenu from './LinkSidebarMenu';
import GroupSideBarNavMenu from './GroupSideBarNavMenu';

export type Props = {
  sideNavBar: SideBarNavItems[];
  pathName: string;
};

const SidebarNavMenu = ({ sideNavBar, pathName }: Props) => {
  return (
    <>
      {sideNavBar.map((item, index) => (
        <ul key={index}>
          {item?.type === 'link' && <LinkSidebarMenu item={item} pathName={pathName} />}
          {item?.type === 'dropDown' && <DropDownSidebarMenu item={item} pathName={pathName} />}
          {item?.type === 'GroupNav' && <GroupSideBarNavMenu item={item} pathName={pathName} />}
        </ul>
      ))}
    </>
  );
};

export default SidebarNavMenu;
