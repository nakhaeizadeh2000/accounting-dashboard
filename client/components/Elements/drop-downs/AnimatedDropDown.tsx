'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

type Props = {
  options: {
    label: string;
    navClass?: string;
    containerClass?: string;
    items: { value: string; label: string }[];
    selectedValue?: { value: string; label: string }; // To hold the selected value
    onChange: (item: { value: string; label: string }) => void; // Callback to handle change
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

export default function AnimatedDropDown({
  options: { label, navClass = '', items, selectedValue, onChange, containerClass },
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

  return (
    <div className={`flex flex-col ${containerClass}`}>
      <motion.p>label</motion.p>
      <motion.nav
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        className={`relative ${navClass}`}
        ref={dropdownRef} // Attach ref to the nav element
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded border border-solid border-transparent bg-neutral-100 p-2 leading-[1.6] text-neutral-600 dark:bg-slate-800 dark:text-neutral-300"
        >
          <p className="leading-[1.6]">{selectedItem?.label}</p>
          <motion.div
            variants={{
              open: { rotate: 180 },
              closed: { rotate: 0 },
            }}
            transition={{ duration: 0.2 }}
            style={{ originY: 0.55 }}
            className="ml-2"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" className="fill-current">
              <path d="M0 7 L 20 7 L 10 16" />
            </svg>
          </motion.div>
        </motion.button>
        <motion.ul
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
          className="absolute z-10 mt-2 w-full rounded border border-solid border-transparent bg-neutral-200 p-1 leading-[1.6] text-neutral-600 dark:bg-slate-700 dark:text-neutral-300"
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
                className={`px-4 py-1 ${item?.value === selectedItem?.value ? 'rounded bg-neutral-300 hover:dark:bg-slate-600' : ''}`}
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
