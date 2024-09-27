'use client';
import { RiArrowDropDownLine } from 'react-icons/ri';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import Link from 'next/link';
import React, { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { getTranslation } from '@/i18n';
import { dropDownItem } from '@/shared/types/sidebar-nav.model';
import { Route } from 'next';

type Props = {
  item: dropDownItem;
  pathName: string;
};

const DropDownSidebarMenu = ({ item, pathName }: Props) => {
  const { IconComponent, childrenItem, name, className } = item;
  const [currentMenu, setCurrentMenu] = useState<string>('');
  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => {
      return oldValue === value ? '' : value;
    });
  };
  const { t } = getTranslation();
  return (
    <>
      <button
        type="button"
        className={`${currentMenu === name ? 'active' : ''} nav-link group w-full`}
        onClick={() => toggleMenu(name)}
      >
        <div className="flex items-center">
          <IconComponent className="shrink-0 group-hover:!text-primary" />
          <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
            {t(name)}
          </span>
        </div>

        <div className={currentMenu !== name ? '-rotate-90 rtl:rotate-90' : ''}>
          <RiArrowDropDownLine className="h-8 w-8" />
        </div>
      </button>

      <AnimateHeight duration={300} height={currentMenu === name ? 'auto' : 0}>
        <ul className="sub-menu text-gray-500">
          {childrenItem.map((item) => (
            <li key={item?.name}>
              <Link href={item?.link as Route}>{t(item?.name)}</Link>
            </li>
          ))}
        </ul>
      </AnimateHeight>
    </>
  );
};

export default DropDownSidebarMenu;
