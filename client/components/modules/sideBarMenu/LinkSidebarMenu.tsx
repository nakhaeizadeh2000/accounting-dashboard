import { getTranslation } from '@/i18n';
import { linkTypeItem } from '@/shared/types/sidebar-nav.model';
import { Route } from 'next';
import Link from 'next/link';
import React from 'react';

type Props = {
  item: linkTypeItem;
  pathName: string;
};

const LinkSidebarMenu = ({ item }: Props) => {
  const { IconComponent, name, link, className } = item;
  const { t } = getTranslation();
  return (
    <>
      <Link href={link as Route} className={`group ${className}`}>
        <div className="flex items-center">
          <IconComponent className="shrink-0 group-hover:!text-primary" />
          <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
            {t(name)}
          </span>
        </div>
      </Link>
    </>
  );
};

export default LinkSidebarMenu;
