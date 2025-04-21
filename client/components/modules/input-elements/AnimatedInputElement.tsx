'use client'; // Ensure this component is treated as a client component

import { LazyMotion, m } from 'framer-motion';
import { ComponentType, HTMLInputTypeAttribute, useEffect, useState, useCallback } from 'react';
import { IconBaseProps, IconType } from 'react-icons';

const loadLazyMotionFeatures = () =>
  import('@/components/lazy-framer-motion').then((res) => res.default);

type IconOption = {
  Icon: IconType | ComponentType<IconBaseProps>;
  iconText?: never;
  iconClass?: string;
};
type IconTextOption = {
  Icon?: never;
  iconText: string;
  iconClass?: string;
};

type Options = {
  isVisible?: boolean;
  isDisabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  containerClass?: string;
  inputClass?: string;
  labelClass?: string;
  type: HTMLInputTypeAttribute;
  key: string;
  fieldError: string[] | undefined;
  icon?: IconOption | IconTextOption;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const AnimatedInputElement = ({
  options: {
    key,
    type,
    isVisible = true,
    isDisabled = false,
    fieldError = undefined,
    defaultValue = '',
    placeholder = undefined,
    label = undefined,
    containerClass = '',
    inputClass = '',
    labelClass = '',
    icon,
    onChange,
  },
}: {
  options: Options;
}) => {
  const [value, setValue] = useState<string>(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(Boolean(defaultValue?.trim()));

  // Update local value when defaultValue changes externally
  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue);
      setIsDirty(Boolean(defaultValue?.trim()));
    }
  }, [defaultValue]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      setIsDirty(Boolean(newValue.trim()));

      // Call external onChange if provided
      if (onChange) {
        onChange(e);
      }
    },
    [onChange],
  );

  return isVisible ? (
    <div>
      <div className={`relative w-full ${containerClass}`}>
        <LazyMotion features={loadLazyMotionFeatures}>
          <m.label
            htmlFor={key}
            className={`pointer-events-none right-2 mb-0 truncate pt-[0.37rem] leading-[1.6] text-neutral-600 dark:text-neutral-300 ${labelClass}`}
            animate={{
              position: 'relative', // Keep it absolute
              top: isDirty || isFocused ? '0' : '1.75rem', // Move up if touched or has value
            }}
            transition={spring}
          >
            {label}
          </m.label>
          <div className="input-parent flex rounded border border-solid border-transparent bg-neutral-100 dark:bg-slate-800">
            <input
              type={type}
              name={key}
              className={`block min-h-[auto] rounded ${icon ? 'w-5/6 rounded-l-none' : 'w-full'} border border-solid border-transparent bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none ring-transparent transition-all duration-200 ease-linear placeholder:opacity-50 focus:border-blue-500 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 ${inputClass}`}
              id={key}
              placeholder={placeholder}
              value={value}
              disabled={isDisabled}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)} // Set focus state
              onBlur={() => setIsFocused(false)} // Reset focus state
            />
            {icon && (
              <div
                className={`flex w-1/6 items-center justify-center border-r border-gray-900 border-opacity-10 dark:border-gray-50 dark:border-opacity-20 ${icon.iconClass ?? ''}`}
              >
                {icon.Icon && <icon.Icon />}
                {icon.iconText && icon.iconText}
              </div>
            )}
          </div>
        </LazyMotion>
      </div>

      {fieldError && fieldError.length > 0 && (
        <ul className="ms-3 mt-1 text-xs text-red-600">
          {fieldError.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  ) : null;
};

export default AnimatedInputElement;

const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
};
