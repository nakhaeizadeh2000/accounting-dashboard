import React from 'react';
import { m } from 'framer-motion';
import { ItemType } from '../types';

interface DropdownListItemProps {
  item: ItemType;
  isSelected: boolean;
  onSelect: (item: ItemType) => void;
  isLTR: boolean;
}

const DropdownListItem: React.FC<DropdownListItemProps> = ({
  item,
  isSelected,
  onSelect,
  isLTR,
}) => {
  return (
    <m.li
      className={`cursor-pointer border border-solid border-transparent text-neutral-600 hover:bg-neutral-300 dark:text-neutral-300 hover:dark:bg-slate-600 ${
        isSelected ? 'bg-neutral-300 dark:bg-slate-600 hover:dark:bg-slate-600' : ''
      }`}
      onClick={() => onSelect(item)}
    >
      <m.p
        className={`text-nowrap px-4 py-1`}
        whileHover={{
          x: isLTR ? '5px' : '-5px',
          width: 'calc(100% - 5px)',
        }}
      >
        {item.label}
      </m.p>
    </m.li>
  );
};

export default DropdownListItem;
