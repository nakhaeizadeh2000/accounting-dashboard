'use client';

import { useState, useRef, useEffect } from 'react';
import { LazyMotion, m } from 'framer-motion';
import { TiArrowSortedDown } from 'react-icons/ti';
import { HiMiniXMark } from 'react-icons/hi2';
import Marquee from 'react-fast-marquee';
import { Chip } from '@mui/material';
import styles from './dropdown.module.scss';

const loadLazyMotionFeatures = () =>
  import('@/components/lazy-framer-motion').then((res) => res.default);

export type ItemType = { value: string | number; label: string };

type Props = {
  options: {
    label: string;
    navClass?: string;
    containerClass?: string;
    labelClass?: string;
    isMarquee?: boolean;
    items?: ItemType[];
    selectedValue?: ItemType[]; // To hold the selected value
    onChange: (item: ItemType[]) => void; // Callback to handle change
    isLoading: boolean;
    onFullScroll?: () => void;
    isLTR?: boolean;
    isMultiSelectable?: boolean;
    multiSelectLabelsViewType?: 'simple' | 'chips';
  };
};

export default function DropDownWidget({
  options: {
    label,
    navClass = '',
    items = [],
    selectedValue = [],
    onChange,
    containerClass,
    labelClass,
    isLoading,
    onFullScroll = () => {},
    isMarquee = false,
    isLTR = false,
    isMultiSelectable = false,
    multiSelectLabelsViewType = 'simple',
  },
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // TODO: when i select some items or a item, and then scrolls to end of list to load new datas, after loading, the state goes empty(because of states behaviours)
  // TODO: when its on multi and uses chips view, scrolling does not make fire onChange(view port issues) and in this mode height of widget is bigger and if select more items, it wraps to new line make its height even bigger that if this issue fix, the scroll to onChange issue will fix too.
  const [selectedItems, setSelectedItems] = useState<ItemType[]>(selectedValue);

  const dropdownRef = useRef<HTMLDivElement>(null); // Create a ref for the dropdown

  // Effect to handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen((prevState) => false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Cleanup event listener
    };
  }, []);

  function onRemoveItemClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isMultiSelectable) {
      setSelectedItems([]);
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.clientHeight;
    if (bottom && !isLoading) {
      onFullScroll();
    }
  };

  function isItemSelected(item: ItemType, reverse = false) {
    const filteredValue = selectedItems.filter((selectedItem) => selectedItem === item);
    return reverse ? !filteredValue.length : !!filteredValue.length;
  }

  function onChangeSelection(item: ItemType) {
    setSelectedItems((prevSelectedItems) => {
      let newData: ItemType[];
      if (isItemSelected(item)) {
        newData = prevSelectedItems.filter(
          (prevSelecteditem) => prevSelecteditem.value !== item.value,
        );
      } else {
        if (isMultiSelectable) {
          newData = [...prevSelectedItems, item];
        } else {
          newData = [item];
        }
      }
      onChange(newData);
      return newData;
    });

    if (!isMultiSelectable) {
      setIsOpen(false);
    }
  }

  return (
    <div className={`flex flex-col ${containerClass}`}>
      <LazyMotion features={loadLazyMotionFeatures}>
        <m.label
          className={`pointer-events-none right-2 z-10 mb-0 truncate pt-[0.37rem] leading-[1.6] text-neutral-600 dark:text-neutral-300 ${labelClass}`}
          animate={{
            position: 'relative', // Keep it absolute
            top: !!selectedItems.length || isOpen ? '0' : '1.95rem', // Move up if touched or has value
          }}
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 30,
          }}
        >
          {label}
        </m.label>
        <m.nav
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          className={`relative rounded border ${isOpen ? 'border-blue-500' : 'border-transparent'} bg-neutral-100 dark:bg-slate-800 ${navClass}`}
          ref={dropdownRef} // Attach ref to the nav element
        >
          <m.button
            title={label}
            id="dropdown-widget-button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between gap-2 rounded border border-solid border-transparent bg-transparent px-3 py-[0.32rem] leading-[1.6] text-neutral-600 dark:bg-slate-800 dark:text-neutral-300"
          >
            <m.div
              whileTap={{ scale: 0.97 }}
              className={`${isMultiSelectable ? 'w-[90%]' : 'w-4/5'} overflow-hidden`}
            >
              {!!selectedItems.length && <SelectedLabel />}
            </m.div>

            <div
              className={`${isMultiSelectable ? 'w-[10%]' : 'w-1/5'} flex items-center justify-end`}
            >
              {!!selectedItems.length && !isMultiSelectable && (
                <HiMiniXMark
                  onClick={onRemoveItemClick}
                  className="justify-end rounded-full bg-neutral-300 dark:bg-slate-600"
                />
              )}
              <m.div
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 },
                }}
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
          <m.ul
            variants={{
              open: {
                clipPath: 'inset(0% 0% 0% 0% round 5px)',
                transition: {
                  type: 'spring',
                  bounce: 0,
                  duration: 0.5,
                },
              },
              closed: {
                clipPath: 'inset(10% 50% 90% 50% round 5px)',
                transition: {
                  type: 'spring',
                  bounce: 0,
                  duration: 0.3,
                },
              },
            }}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
            className="absolute z-10 mt-2 min-h-[50px] w-full rounded border border-solid border-transparent bg-neutral-200 p-1 leading-[1.6] text-neutral-600 dark:bg-slate-700 dark:text-neutral-300"
          >
            <div
              onScroll={handleScroll}
              className={`max-h-[300px] overflow-auto overflow-x-scroll ${isLTR ? 'direction-ltr' : ''} scrollbar scrollbar-track-transparent scrollbar-thumb-slate-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-w-2 scrollbar-h-2 dark:scrollbar-track-transparent dark:scrollbar-thumb-slate-300`}
            >
              <div className="max-h-[300px] w-max min-w-full">
                {items.length ? (
                  items.map((item) => (
                    <m.li
                      key={item.value}
                      className={`cursor-pointer border border-solid border-transparent text-neutral-600 hover:bg-neutral-300 dark:text-neutral-300 hover:dark:bg-slate-600 ${isItemSelected(item) ? 'bg-neutral-300 dark:bg-slate-600 hover:dark:bg-slate-600' : ''}`}
                      onClick={() => onChangeSelection(item)}
                    >
                      <m.p
                        className={`px-4 py-1`}
                        whileHover={{
                          x: isLTR ? '5px' : '-5px',
                          width: 'calc(100% - 5px)',
                        }}
                      >
                        {item.label}
                      </m.p>
                    </m.li>
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
        </m.nav>
      </LazyMotion>
    </div>
  );

  function SelectedLabel() {
    if (!isMultiSelectable) {
      return isMarquee ? (
        <Marquee
          speed={50}
          autoFill={true}
          pauseOnHover={true}
          direction="right"
          className="direction-ltr"
        >
          <p className="px-2 leading-[1.6]">{selectedItems[0].label}</p>
        </Marquee>
      ) : (
        <p className="px-2 leading-[1.6]">{selectedItems[0].label}</p>
      );
    } else {
      if (multiSelectLabelsViewType === 'simple') {
        return (
          <p className={`text-nowrap leading-[1.6] ${isLTR ? 'direction-ltr' : 'direction-rtl'}`}>
            {selectedItems.map((item) =>
              selectedItems.length > 1 ? `${item.label} , ` : item.label,
            )}
          </p>
        );
      }
      if (multiSelectLabelsViewType === 'chips') {
        return selectedItems.map((item) => (
          <Chip
            // className="m-[0.125rem]"
            className={styles.chips_margin}
            key={item.value}
            label={item.label}
            onDelete={() => onChangeSelection(item)}
          />
        ));
      }
    }
  }
}
