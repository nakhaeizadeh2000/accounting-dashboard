'use client'; // Ensure this component is treated as a client component

import { motion } from 'framer-motion';
import { HTMLInputTypeAttribute, useEffect, useState } from 'react';

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
};

const AnimatedInputElement = ({
  options: {
    key,
    type,
    isVisible = true,
    isDisabled = false,
    fieldError = undefined,
    defaultValue = undefined,
    placeholder = undefined,
    label = undefined,
  },
}: {
  options: Options;
}) => {
  const [inputOptions, setInputOptions] = useState<
    Omit<Options, 'containerClass' | 'inputClass' | 'labelClass'>
  >({
    key,
    type,
    isDisabled,
    isVisible,
    fieldError,
    defaultValue,
    placeholder,
    label,
  });
  const [isFocused, setIsFocused] = useState(false);
  // Determine if the label should be animated
  const isDirty = isFocused || inputOptions.defaultValue?.trim() !== '';

  useEffect(() => {
    setInputOptions((prev) => ({ ...prev, fieldError, isDisabled, isVisible, defaultValue }));
  }, [fieldError, isDisabled, isVisible, defaultValue]);

  // --tw-border-opacity: 1;
  // border-color: rgb(67 97 238 / var(--tw-border-opacity));
  // --tw-ring-color: transparent;

  return inputOptions.isVisible ? (
    <div>
      <div className="relative mt-8">
        <motion.label
          htmlFor={inputOptions.key}
          className="pointer-events-none right-3 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-600 dark:text-neutral-300"
          animate={{
            position: 'absolute', // Keep it absolute
            top: isDirty ? '-1.75rem' : '0', // Move up if touched or has value
            fontSize: isDirty ? '0.75rem' : '0.9rem', // Smaller font size when active
          }}
          transition={spring}
        >
          {inputOptions.label}
        </motion.label>
        <input
          type={inputOptions.type}
          name={inputOptions.key}
          className="block min-h-[auto] w-full rounded bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder:opacity-50 focus:border focus:border-solid focus:border-blue-500 focus:ring-transparent motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300"
          id={inputOptions.key}
          placeholder={inputOptions.placeholder}
          value={inputOptions.defaultValue || ''}
          disabled={inputOptions.isDisabled}
          onChange={(e) =>
            setInputOptions((prev) => ({
              ...prev,
              defaultValue: e.target.value,
            }))
          }
          onFocus={() => setIsFocused(true)} // Set focus state
          onBlur={() => setIsFocused(false)} // Reset focus state
        />
      </div>
      {inputOptions?.fieldError && (
        <ul className="ms-3 mt-1 text-xs text-red-600">
          {inputOptions.fieldError.map((error, index) => (
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
