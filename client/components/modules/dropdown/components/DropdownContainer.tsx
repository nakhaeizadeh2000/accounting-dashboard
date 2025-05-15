import React from 'react';
import { m } from 'framer-motion';
import { LazyMotion } from 'framer-motion';

interface DropdownContainerProps {
  children: React.ReactNode;
  containerClass?: string;
  label: string;
  labelClass?: string;
  isDisabled?: boolean;
  isOpen: boolean;
  selectedItemsLength: number;
  getLabelColorClass: () => string;
  getBorderClass: () => string;
  navClass?: string;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const DropdownContainer: React.FC<DropdownContainerProps> = ({
  children,
  containerClass = '',
  label,
  labelClass = '',
  isDisabled = false,
  isOpen,
  selectedItemsLength,
  getLabelColorClass,
  getBorderClass,
  navClass = '',
  dropdownRef,
}) => {
  const loadLazyMotionFeatures = () =>
    import('@/components/lazy-framer-motion').then((res) => res.default);

  return (
    <div className={`flex flex-col ${containerClass}`}>
      <LazyMotion features={loadLazyMotionFeatures}>
        <m.label
          className={`pointer-events-none right-2 z-10 mb-0 truncate pt-[0.37rem] leading-[1.6] ${getLabelColorClass()} ${labelClass} ${
            isDisabled ? 'opacity-60' : ''
          }`}
          animate={{
            position: 'relative',
            top: !!selectedItemsLength || isOpen ? '0' : '1.95rem',
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
          className={`relative rounded border ${getBorderClass()} bg-neutral-100 dark:bg-slate-800 ${navClass} ${
            isDisabled ? 'cursor-not-allowed opacity-60' : ''
          }`}
          ref={dropdownRef}
        >
          {children}
        </m.nav>
      </LazyMotion>
    </div>
  );
};

export default DropdownContainer;
