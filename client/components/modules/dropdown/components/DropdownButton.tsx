import React from 'react';
import { m } from 'framer-motion';
import { HiMiniXMark } from 'react-icons/hi2';
import { TiArrowSortedDown } from 'react-icons/ti';
import { DROPDOWN_ARROW_VARIANTS } from '../constants';
import SelectedDisplay from './SelectedDisplay';
import { ItemType } from '../types';

interface DropdownButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
  isDisabled?: boolean;
  handleDropdownToggle: () => void;
  label: string;
  selectedItems: ItemType[];
  isMultiSelectable?: boolean;
  handleRemoveItem: (e: React.MouseEvent, item?: ItemType) => void;
  isMarquee?: boolean;
  isLTR?: boolean;
  multiSelectLabelsViewType?: 'simple' | 'chips';
  isOpen?: boolean;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  buttonRef,
  isDisabled = false,
  handleDropdownToggle,
  label,
  selectedItems,
  isMultiSelectable = false,
  handleRemoveItem,
  isMarquee = false,
  isLTR = false,
  multiSelectLabelsViewType = 'simple',
  isOpen = false,
}) => {
  return (
    <m.button
      title={label}
      id="dropdown-widget-button"
      onClick={handleDropdownToggle}
      className={`flex w-full items-center justify-between gap-2 rounded border border-solid border-transparent bg-transparent px-3 py-[0.32rem] leading-[1.6] text-neutral-600 dark:bg-slate-800 dark:text-neutral-300 ${
        isDisabled ? 'cursor-not-allowed' : ''
      }`}
      ref={buttonRef}
      disabled={isDisabled}
    >
      <div className={`${isMultiSelectable ? 'w-[90%]' : 'w-4/5'} overflow-hidden`}>
        {!!selectedItems.length && (
          <SelectedDisplay
            selectedItems={selectedItems}
            isMarquee={isMarquee}
            isLTR={isLTR}
            multiSelectLabelsViewType={multiSelectLabelsViewType}
            isMultiSelectable={isMultiSelectable}
            onChangeSelection={(item) => handleRemoveItem(new MouseEvent('click') as any, item)}
          />
        )}
      </div>

      <div className={`${isMultiSelectable ? 'w-[10%]' : 'w-1/5'} flex items-center justify-end`}>
        {!!selectedItems.length && !isMultiSelectable && (
          <HiMiniXMark
            onClick={(e) => handleRemoveItem(e)}
            className={`justify-end rounded-full bg-neutral-300 dark:bg-slate-600 ${
              isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          />
        )}
        <m.div
          variants={DROPDOWN_ARROW_VARIANTS}
          transition={{ duration: 0.2 }}
          style={{ originY: 0.55 }}
          className={`${isMultiSelectable ? 'w-full' : 'w-1/2'} flex min-h-[auto] justify-center py-[0.24rem]`}
        >
          <TiArrowSortedDown
            className="fill-current text-dark dark:text-white-dark"
            size={'15px'}
            viewBox="0 0 23 20"
          />
        </m.div>
      </div>
    </m.button>
  );
};

export default DropdownButton;
