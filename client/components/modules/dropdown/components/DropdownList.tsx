import React from 'react';
import { m } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ItemType } from '../types';
import { DROPDOWN_LIST_VARIANTS } from '../constants';
import DropdownListItem from './DropdownListItem';

interface DropdownListProps {
  isOpen: boolean;
  isDisabled: boolean;
  appendToBody: boolean;
  dropdownPosition: {
    top: number;
    left: number;
    width: number;
  };
  setPortalElement: (element: HTMLUListElement | null) => void;
  items: ItemType[];
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isLTR: boolean;
  isLoading: boolean | undefined;
  label: string;
  handleItemSelection: (item: ItemType) => void;
  isItemSelected: (item: ItemType, isReversed?: boolean) => boolean;
}

const DropdownList: React.FC<DropdownListProps> = ({
  isOpen,
  isDisabled,
  appendToBody,
  dropdownPosition,
  setPortalElement,
  items,
  handleScroll,
  isLTR,
  isLoading,
  label,
  handleItemSelection,
  isItemSelected,
}) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const renderDropdownList = () => (
    <m.ul
      variants={DROPDOWN_LIST_VARIANTS}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      className="z-50 rounded border border-solid border-transparent bg-neutral-200 p-1 leading-[1.6] text-neutral-600 dark:bg-slate-700 dark:text-neutral-300"
      ref={setPortalElement}
    >
      <div
        onScroll={handleScroll}
        className={`max-h-[300px] overflow-auto ${
          isLTR ? 'direction-ltr' : ''
        } scrollbar scrollbar-track-transparent scrollbar-thumb-slate-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-w-2 scrollbar-h-2 dark:scrollbar-track-transparent dark:scrollbar-thumb-slate-300`}
      >
        <div className="w-max min-w-full">
          {items.length ? (
            items.map((item) => (
              <DropdownListItem
                key={item.value}
                item={item}
                isSelected={isItemSelected(item)}
                isLTR={isLTR}
                onSelect={handleItemSelection}
              />
            ))
          ) : (
            <m.li
              key={label}
              className={`flex h-[32px] items-center justify-center bg-transparent text-neutral-400 dark:text-neutral-500`}
            >
              !داده ای جهت نمایش وجود ندارد
            </m.li>
          )}
        </div>
      </div>
    </m.ul>
  );

  if (!isOpen || isDisabled) return null;

  if (appendToBody && isMounted) {
    return createPortal(
      <div
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 9999,
        }}
      >
        {renderDropdownList()}
      </div>,
      document.body,
    );
  }

  return <div className="absolute left-0 top-full z-10 mt-1 w-full">{renderDropdownList()}</div>;
};

export default DropdownList;
