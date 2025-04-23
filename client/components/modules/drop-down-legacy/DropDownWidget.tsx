'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LazyMotion, m } from 'framer-motion';
import { TiArrowSortedDown } from 'react-icons/ti';
import { HiMiniXMark } from 'react-icons/hi2';
import { ItemType, Props } from './drop-down.type';
import { SelectedLabel } from './SelectedLabel';
import { createPortal } from 'react-dom';

const loadLazyMotionFeatures = () =>
  import('@/components/lazy-framer-motion').then((res) => res.default);

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
    appendToBody = false,
    isDisabled = false, // Default to not disabled
    isValid = true, // Default to valid
  },
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ItemType[]>(selectedValue);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [portalElement, setPortalElement] = useState<HTMLUListElement | null>(null);

  // Track if we've mounted to prevent SSR issues with createPortal
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Effect to handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click was outside both the dropdown and the portal
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const clickedOutsidePortal = !portalElement || !portalElement.contains(event.target as Node);

      // Only close if the click was outside both elements
      if (clickedOutsideDropdown && clickedOutsidePortal) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [portalElement]);

  // Effect to calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current && appendToBody) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, appendToBody]);

  // Handle window resize to update dropdown position
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && buttonRef.current && appendToBody) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, appendToBody]);

  // Update selectedItems when selectedValue changes from parent
  useEffect(() => {
    setSelectedItems(selectedValue);
  }, [selectedValue]);

  function onRemoveItemClick(e: React.MouseEvent) {
    if (isDisabled) return; // Prevent actions when disabled
    
    e.stopPropagation();
    if (!isMultiSelectable) {
      setSelectedItems([]);
      onChange([]);
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight <= e.currentTarget.scrollTop + e.currentTarget.clientHeight + 10;
    if (bottom && !isLoading) {
      onFullScroll();
    }
  };

  function isItemSelected(item: ItemType, isReversed: boolean = false) {
    const filteredValue = selectedItems.filter((selectedItem) => selectedItem.value === item.value);
    return isReversed ? !filteredValue.length : !!filteredValue.length;
  }

  function onChangeSelection(item: ItemType) {
    if (isDisabled) return; // Prevent selection changes when disabled
    
    setSelectedItems((prevSelectedItems) => {
      let newData: ItemType[];
      if (isItemSelected(item)) {
        newData = prevSelectedItems.filter(
          (prevSelectedItem) => prevSelectedItem.value !== item.value,
        );
      } else {
        if (isMultiSelectable) {
          newData = [...prevSelectedItems, item];
        } else {
          newData = [item];
        }
      }
      // Call the parent onChange handler
      onChange(newData);
      return newData;
    });

    if (!isMultiSelectable) {
      setIsOpen(false);
    }
  }

  const handleDropdownToggle = () => {
    if (isDisabled) return; // Prevent opening dropdown when disabled
    setIsOpen(!isOpen);
  };

  const renderDropdownList = () => (
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
      className="z-50 rounded border border-solid border-transparent bg-neutral-200 p-1 leading-[1.6] text-neutral-600 dark:bg-slate-700 dark:text-neutral-300"
      ref={setPortalElement}
    >
      <div
        onScroll={handleScroll}
        className={`max-h-[300px] overflow-auto ${isLTR ? 'direction-ltr' : ''} scrollbar scrollbar-track-transparent scrollbar-thumb-slate-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-w-2 scrollbar-h-2 dark:scrollbar-track-transparent dark:scrollbar-thumb-slate-300`}
      >
        <div className="w-max min-w-full">
          {items.length ? (
            items.map((item) => (
              <m.li
                key={item.value}
                className={`cursor-pointer border border-solid border-transparent text-neutral-600 hover:bg-neutral-300 dark:text-neutral-300 hover:dark:bg-slate-600 ${isItemSelected(item) ? 'bg-neutral-300 dark:bg-slate-600 hover:dark:bg-slate-600' : ''}`}
                onClick={() => onChangeSelection(item)}
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

  // Determine border color based on validation and focus state
  const getBorderClass = () => {
    if (!isValid) return 'border-red-500'; // Invalid state - red border
    if (isOpen) return 'border-blue-500'; // Focused state - blue border
    return 'border-transparent'; // Default state - transparent border
  };

  // Determine label color based on validation state
  const getLabelColorClass = () => {
    if (!isValid) return 'text-red-500'; // Invalid state - red text
    return 'text-neutral-600 dark:text-neutral-300'; // Default state
  };

  return (
    <div className={`flex flex-col ${containerClass}`}>
      <LazyMotion features={loadLazyMotionFeatures}>
        <m.label
          className={`pointer-events-none right-2 z-10 mb-0 truncate pt-[0.37rem] leading-[1.6] ${getLabelColorClass()} ${labelClass} ${isDisabled ? 'opacity-60' : ''}`}
          animate={{
            position: 'relative',
            top: !!selectedItems.length || isOpen ? '0' : '1.95rem',
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
          className={`relative rounded border ${getBorderClass()} bg-neutral-100 dark:bg-slate-800 ${navClass} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          ref={dropdownRef}
        >
          <m.button
            title={label}
            id="dropdown-widget-button"
            onClick={handleDropdownToggle}
            className={`flex w-full items-center justify-between gap-2 rounded border border-solid border-transparent bg-transparent px-3 py-[0.32rem] leading-[1.6] text-neutral-600 dark:bg-slate-800 dark:text-neutral-300 ${isDisabled ? 'cursor-not-allowed' : ''}`}
            ref={buttonRef}
            disabled={isDisabled}
          >
            <m.div
              whileTap={{ scale: isDisabled ? 1 : 0.97 }}
              className={`${isMultiSelectable ? 'w-[90%]' : 'w-4/5'} overflow-hidden`}
            >
              {!!selectedItems.length && (
                <SelectedLabel
                  selectedItems={selectedItems}
                  isMarquee={isMarquee}
                  isLTR={isLTR}
                  multiSelectLabelsViewType={multiSelectLabelsViewType}
                  isMultiSelectable={isMultiSelectable}
                  onChangeSelection={onChangeSelection}
                />
              )}
            </m.div>

            <div
              className={`${isMultiSelectable ? 'w-[10%]' : 'w-1/5'} flex items-center justify-end`}
            >
              {!!selectedItems.length && !isMultiSelectable && (
                <HiMiniXMark
                  onClick={onRemoveItemClick}
                  className={`justify-end rounded-full bg-neutral-300 dark:bg-slate-600 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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

          {/* Dropdown list - either appended to body or rendered in place */}
          {isOpen && !isDisabled && appendToBody && isMounted
            ? createPortal(
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
              )
            : isOpen && !isDisabled && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full">
                  {renderDropdownList()}
                </div>
              )}
        </m.nav>
      </LazyMotion>
    </div>
  );
}
