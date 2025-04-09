'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { Checkbox as MuiCheckbox } from '@mui/material';
import { CheckboxProps } from '../types/CheckBoxTypes';
import { mergeCheckboxOptions } from '../utils/checkBoxUtils';

/**
 * Props for the AdvancedCheckbox component
 */
interface AdvancedCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  /**
   * Additional CSS classes for the ripple effect
   */
  rippleClassName?: string;

  /**
   * Whether to show ripple effect on interaction
   * @default true
   */
  enableRipple?: boolean;

  /**
   * Custom animation duration for the ripple
   * @default 550 (milliseconds)
   */
  rippleDuration?: number;

  /**
   * Custom content to show when checked (replaces default checkbox)
   */
  checkedContent?: React.ReactNode;

  /**
   * Custom content to show when unchecked (replaces default checkbox)
   */
  uncheckedContent?: React.ReactNode;

  /**
   * Whether to use custom animations for state changes
   * @default true
   */
  animated?: boolean;

  /**
   * Whether to play a sound effect on state change
   * @default false
   */
  soundEffect?: boolean | string;

  /**
   * Callback fired when the state changes
   */
  onChange?: (checked: boolean, event?: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Advanced checkbox component with ripple effects, animations, and sound effects
 */
const AdvancedCheckbox: React.FC<AdvancedCheckboxProps> = ({
  rippleClassName,
  enableRipple = true,
  rippleDuration = 550,
  checkedContent,
  uncheckedContent,
  animated = true,
  soundEffect = false,
  onChange,
  ...props
}) => {
  // Merge with default options
  const options = mergeCheckboxOptions(props);

  // Track checked state
  const [checked, setChecked] = useState<boolean>(
    props.checked !== undefined ? props.checked : props.defaultChecked || false,
  );

  // Track ripple state
  const [showRipple, setShowRipple] = useState<boolean>(false);

  // Reference to audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update internal state when external value changes (for controlled component)
  useEffect(() => {
    if (props.checked !== undefined) {
      setChecked(props.checked);
    }
  }, [props.checked]);

  // Handle checkbox change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;

    // Update internal state (for uncontrolled component)
    if (props.checked === undefined) {
      setChecked(newChecked);
    }

    // Show ripple effect if enabled
    if (enableRipple) {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), rippleDuration);
    }

    // Play sound effect if enabled
    if (soundEffect) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Handle play() promise rejection (e.g., autoplay policy)
          console.warn('Could not play checkbox sound effect');
        });
      }
    }

    // Call external onChange handler
    if (onChange) {
      onChange(newChecked, event);
    }

    // Call original onChange handler
    if (props.onChange) {
      props.onChange(event, newChecked);
    }
  };

  // Determine sound effect URL
  const soundEffectUrl =
    typeof soundEffect === 'string' ? soundEffect : '/sounds/checkbox-click.mp3'; // Default sound effect

  return (
    <div className={`relative inline-flex ${options.className || ''}`}>
      {/* Sound effect audio element (if enabled) */}
      {soundEffect && (
        <audio ref={audioRef} preload="auto" className="hidden">
          <source src={soundEffectUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* Ripple effect */}
      {enableRipple && (
        <Transition
          show={showRipple}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave={`transition-all duration-${rippleDuration}`}
          leaveFrom="opacity-100 scale-0"
          leaveTo="opacity-0 scale-200"
          className={`absolute inset-0 z-0 rounded-full bg-current opacity-20 ${rippleClassName || ''}`}
        />
      )}

      {/* Custom content for checked/unchecked states */}
      {(checkedContent || uncheckedContent) && (
        <div className="relative z-10">
          <Transition
            show={checked}
            enter="transition-all duration-200"
            enterFrom="opacity-0 scale-75"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-75"
            className="absolute inset-0"
          >
            <div>{checkedContent}</div>
          </Transition>

          <Transition
            show={!checked}
            enter="transition-all duration-200"
            enterFrom="opacity-0 scale-75"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-75"
            className="absolute inset-0"
          >
            <div>{uncheckedContent}</div>
          </Transition>
        </div>
      )}

      {/* MUI Checkbox (hidden if custom content is provided) */}
      <div className={checkedContent || uncheckedContent ? 'invisible opacity-0' : ''}>
        <MuiCheckbox
          checked={checked}
          onChange={handleChange}
          disabled={options.disabled}
          color={options.color as any}
          size={options.size}
          indeterminate={options.indeterminate}
          required={options.required}
          icon={options.icon}
          checkedIcon={options.checkedIcon}
          indeterminateIcon={options.indeterminateIcon}
          name={props.name}
          value={props.value}
          id={props.id}
          inputProps={{
            'aria-label': options.ariaLabel,
            'aria-labelledby': options.ariaLabelledby,
            'aria-describedby': options.ariaDescribedby,
            ...options.inputProps,
          }}
          sx={{
            transition: animated ? 'transform 0.2s, opacity 0.2s' : 'none',
            transform: checked ? 'scale(1)' : 'scale(0.85)',
            ...options.sx,
          }}
        />
      </div>

      {/* Label (if provided) */}
      {options.label && (
        <label
          htmlFor={props.id}
          className={`ml-2 select-none ${options.labelClassName || ''} ${
            options.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {options.label}
        </label>
      )}

      {/* Helper Text (if provided) */}
      {options.helperText && (
        <div
          className={`mt-1 text-xs ${options.error ? 'text-red-500' : 'text-gray-500'} ${
            options.helperTextClassName || ''
          }`}
        >
          {options.helperText}
        </div>
      )}
    </div>
  );
};

export default AdvancedCheckbox;
