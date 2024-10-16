'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';

type Props = {
  options: {
    label: string;
    navClass?: string;
    items: { value: string; label: string }[];
    selectedValue?: { value: string; label: string }; // To hold the selected value
    onChange: (item: { value: string; label: string }) => void; // Callback to handle change
  };
};

const itemVariants: Variants = {
  open: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  closed: {
    opacity: 0,
    scale: 0.3,
    filter: 'blur(20px)',
    transition: { duration: 0.2 },
  },
};

export default function AnimatedDropDown({
  options: { label, navClass = '', items, selectedValue, onChange },
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ value: string; label: string } | undefined>(
    selectedValue,
  );

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      className={`relative ${navClass}`}
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded border border-solid border-transparent bg-neutral-100 p-2 leading-[1.6] text-neutral-600 dark:bg-slate-800 dark:text-neutral-300"
      >
        {selectedItem?.label || label}
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
              when: 'afterChildren',
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
            variants={itemVariants}
            onClick={() => {
              onChange(item);
              setIsOpen(false); // Close dropdown after selection
              setSelectedItem((prevItem) => item);
            }}
          >
            {item.label}
          </motion.li>
        ))}
      </motion.ul>
    </motion.nav>
  );
}
