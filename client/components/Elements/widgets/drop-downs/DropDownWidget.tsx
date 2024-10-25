'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TiArrowSortedDown } from 'react-icons/ti';
import { HiMiniXMark } from 'react-icons/hi2';
import Marquee from 'react-fast-marquee';

type Props = {
  options: {
    label: string;
    navClass?: string;
    containerClass?: string;
    labelClass?: string;
    isMarquee?: boolean;
    items?: { value: string; label: string }[];
    selectedValue?: { value: string; label: string }; // To hold the selected value
    onChange: (item: { value: string; label: string }) => void; // Callback to handle change
    isLoading: boolean;
    onFullScroll?: () => void;
    isLTR?: boolean;
  };
};

export default function DropDownWidget({
  options: {
    label,
    navClass = '',
    items = [],
    selectedValue,
    onChange,
    containerClass,
    labelClass,
    isLoading,
    onFullScroll = () => {},
    isMarquee = false,
    isLTR = false,
  },
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ value: string; label: string } | undefined>(
    selectedValue,
  );

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
    setSelectedItem(undefined);
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.clientHeight;
    if (bottom && !isLoading) {
      onFullScroll();
    }
  };

  return (
    <div className={`flex flex-col ${containerClass}`}>
      <motion.label
        className={`pointer-events-none right-2 z-10 mb-0 truncate pt-[0.37rem] leading-[1.6] text-neutral-600 dark:text-neutral-300 ${labelClass}`}
        animate={{
          position: 'relative', // Keep it absolute
          top: selectedItem?.value || isOpen ? '0' : '1.95rem', // Move up if touched or has value
        }}
        transition={{
          type: 'spring',
          stiffness: 700,
          damping: 30,
        }}
      >
        {label}
      </motion.label>
      <motion.nav
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        className={`relative rounded border ${isOpen ? 'border-blue-500' : 'border-transparent'} bg-neutral-100 dark:bg-slate-800 ${navClass}`}
        ref={dropdownRef} // Attach ref to the nav element
      >
        <motion.button
          title={label}
          id="dropdown-widget-button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded border border-solid border-transparent bg-transparent px-3 py-[0.32rem] leading-[1.6] text-neutral-600 dark:bg-slate-800 dark:text-neutral-300"
        >
          <motion.div whileTap={{ scale: 0.97 }} className="w-4/5 overflow-hidden">
            {selectedItem?.label &&
              (isMarquee ? (
                <Marquee
                  speed={50}
                  autoFill={true}
                  pauseOnHover={true}
                  direction="right"
                  className="direction-ltr"
                >
                  <p className="px-2 leading-[1.6]">{selectedItem?.label}</p>
                </Marquee>
              ) : (
                <p className="px-2 leading-[1.6]">{selectedItem?.label}</p>
              ))}
          </motion.div>

          <div className="flex w-1/5 items-center justify-end">
            {selectedItem?.value && (
              <HiMiniXMark
                onClick={onRemoveItemClick}
                className="justify-end rounded-full bg-neutral-300 dark:bg-slate-600"
              />
            )}
            <motion.div
              variants={{
                open: { rotate: 180 },
                closed: { rotate: 0 },
              }}
              transition={{ duration: 0.2 }}
              style={{ originY: 0.55 }}
              className="flex min-h-[auto] w-1/2 justify-center py-[0.24rem]"
            >
              <TiArrowSortedDown
                className="fill-current text-dark dark:text-white-dark"
                size={'15px'}
                viewBox="0 0 20 20"
              />
            </motion.div>
          </div>
        </motion.button>
        <motion.ul
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
                  <motion.li
                    key={item.value}
                    className={`cursor-pointer rounded border border-solid border-transparent text-neutral-600 ${item?.value !== selectedItem?.value ? 'hover:bg-neutral-300 hover:dark:bg-slate-600' : ''} dark:text-neutral-300`}
                    onClick={() => {
                      onChange(item);
                      setIsOpen(false); // Close dropdown after selection
                      setSelectedItem((prevItem) => item);
                    }}
                  >
                    <motion.p
                      className={`px-4 py-1 ${item?.value === selectedItem?.value ? 'rounded bg-neutral-300 dark:bg-slate-600 hover:dark:bg-slate-600' : ''}`}
                      whileHover={{
                        x: item?.value !== selectedItem?.value ? (isLTR ? '5px' : '-5px') : '0px',
                        width: item?.value !== selectedItem?.value ? 'calc(100% - 5px)' : '100%',
                      }}
                    >
                      {item.label}
                    </motion.p>
                  </motion.li>
                ))
              ) : (
                <motion.li
                  key={label}
                  className={`flex h-[32px] items-center justify-center bg-transparent text-neutral-400 dark:text-neutral-500`}
                >
                  !داده ای جهت نمایش وجود ندارد
                </motion.li>
              )}
            </div>
          </div>
        </motion.ul>
      </motion.nav>
    </div>
  );
}
