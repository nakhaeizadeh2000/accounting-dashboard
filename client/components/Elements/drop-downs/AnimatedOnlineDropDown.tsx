'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
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
    onFullScroll: () => void;
  };
};

const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

export default function AnimatedOnlineDropDown({
  options: {
    label,
    navClass = '',
    items = [],
    selectedValue,
    onChange,
    containerClass,
    labelClass,
    isLoading,
    onFullScroll,
    isMarquee = false,
  },
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // const [page, setPage] = useState(1);
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

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
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
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded border border-solid border-transparent bg-transparent px-3 py-[0.32rem] leading-[1.6] text-neutral-600 dark:bg-slate-800 dark:text-neutral-300"
        >
          <div className="w-4/5 overflow-hidden">
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
          </div>

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
              className="flex min-h-[auto] w-1/2 justify-end py-[0.24rem]"
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
          onScroll={handleScroll}
          variants={{
            open: {
              clipPath: 'inset(0% 0% 0% 0% round 5px)',
              transition: {
                type: 'spring',
                bounce: 0,
                duration: 0.5,
                delayChildren: 0.3,
                staggerChildren: 0.1,
              },
            },
            closed: {
              clipPath: 'inset(10% 50% 90% 50% round 5px)',
              transition: {
                type: 'spring',
                bounce: 0,
                duration: 0.3,

                staggerDirection: -1,
                staggerChildren: 0.06,
              },
            },
          }}
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          className="absolute z-10 mt-2 max-h-[300px] w-full overflow-y-auto rounded border border-solid border-transparent bg-neutral-200 p-1 leading-[1.6] text-neutral-600 dark:bg-slate-700 dark:text-neutral-300"
        >
          {items.map((item) => (
            <motion.li
              key={item.value}
              className={`var(--color-neutral-100 cursor-pointer rounded border border-solid border-transparent text-neutral-600 ${item?.value !== selectedItem?.value ? 'hover:bg-neutral-300 hover:dark:bg-slate-600' : ''} dark:text-neutral-300`}
              variants={itemVariants}
              onClick={() => {
                onChange(item);
                setIsOpen(false); // Close dropdown after selection
                setSelectedItem((prevItem) => item);
              }}
            >
              <motion.p
                className={`px-4 py-1 ${item?.value === selectedItem?.value ? 'rounded bg-neutral-300 dark:bg-slate-600 hover:dark:bg-slate-600' : ''}`}
                whileHover={{
                  x: item?.value !== selectedItem?.value ? '-7px' : '0px',
                }}
              >
                {item.label}
              </motion.p>
            </motion.li>
          ))}
        </motion.ul>
      </motion.nav>
    </div>
  );
}
