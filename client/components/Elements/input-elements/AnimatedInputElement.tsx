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
    containerClass = '',
    inputClass = '',
    labelClass = '',
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

  return inputOptions.isVisible ? (
    <div>
      <div className={`relative w-full ${containerClass}`}>
        <motion.label
          htmlFor={inputOptions.key}
          className={`pointer-events-none right-2 mb-0 truncate pt-[0.37rem] leading-[1.6] text-neutral-600 dark:text-neutral-300 ${labelClass}`}
          animate={{
            position: 'relative', // Keep it absolute
            top: isDirty ? '0' : '1.75rem', // Move up if touched or has value
          }}
          transition={spring}
        >
          {inputOptions.label}
        </motion.label>
        <input
          type={inputOptions.type}
          name={inputOptions.key}
          className={`block min-h-[auto] w-full rounded border border-solid border-transparent bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none ring-transparent transition-all duration-200 ease-linear placeholder:opacity-50 focus:border-blue-500 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 ${inputClass}`}
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
