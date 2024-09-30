import { GroupSideBarNavItem } from '@/shared/types/sidebar-nav.model';
import React from 'react';
import LinkSidebarMenu from './LinkSidebarMenu';
import DropDownSidebarMenu from './DropDownSidebarMenu';
import { getTranslation } from '@/i18n';

type Props = {
  item: GroupSideBarNavItem;
  pathName: string;
};

const GroupSideBarNavMenu = ({ item, pathName }: Props) => {
  const { t } = getTranslation();
  const { IconHeader, childrenHeader, titleHeader, classHeader } = item;
  return (
    <>
      <h2
        className={`-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08] ${classHeader}`}
      >
        <IconHeader className="hidden h-5 w-4 flex-none" />
        <span>{t(titleHeader)}</span>
      </h2>
      {item.childrenHeader && (
        <li className="nav-item">
          {childrenHeader.map((childItem, index) => (
            <div key={index} className="nav-item">
              {childItem.type === 'link' && (
                <LinkSidebarMenu item={childItem} pathName={pathName} />
              )}
              {childItem.type === 'dropDown' && (
                <DropDownSidebarMenu item={childItem} pathName={pathName} />
              )}
            </div>
          ))}
        </li>
      )}
    </>
  );
};

export default GroupSideBarNavMenu;
