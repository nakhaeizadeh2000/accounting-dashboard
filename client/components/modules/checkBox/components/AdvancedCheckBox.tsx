// AdvancedCheckbox.tsx - Improved implementation
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { Checkbox as MuiCheckbox } from '@mui/material';
import { AdvancedCheckboxProps } from '../types/CheckBoxTypes';
import { mergeCheckboxOptions, generateId } from '../utils/checkBoxUtils';

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
  // Generate ID if not provided
  const id = props.id || generateId('advanced-checkbox');

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
    if (soundEffect && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        console.warn('Could not play checkbox sound effect');
      });
    }

    // Call external onChange handler
    if (onChange) {
      onChange(newChecked, event);
    }

    // Call original onChange handler
    if (onChange) {
      onChange(newChecked, event);
    }
  };

  // Determine sound effect URL
  const soundEffectUrl =
    typeof soundEffect === 'string' ? soundEffect : '/sounds/checkbox-click.mp3';

  return (
    <div
      className={`relative inline-flex ${options.className || ''}`}
      data-testid={`adv-checkbox-${id}`}
    >
      {/* Sound effect audio element (if enabled) */}
      {soundEffect && (
        <audio ref={audioRef} preload="auto" className="hidden">
          <source src={soundEffectUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* Ripple effect */}
      {enableRipple && (
        <Transition
          as={React.Fragment}
          show={showRipple}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave={`transition-all duration-${rippleDuration}`}
          leaveFrom="opacity-100 scale-0"
          leaveTo="opacity-0 scale-200"
        />
      )}

      {/* Custom content for checked/unchecked states */}
      {(checkedContent || uncheckedContent) && (
        <div className="relative z-10">
          <Transition
            as={React.Fragment}
            show={checked}
            enter="transition-all duration-200"
            enterFrom="opacity-0 scale-75"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-75"
          >
            <div>{checkedContent}</div>
          </Transition>

          <Transition
            as={React.Fragment}
            show={!checked}
            enter="transition-all duration-200"
            enterFrom="opacity-0 scale-75"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-75"
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
          id={id}
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
          htmlFor={id}
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

AdvancedCheckbox.displayName = 'AdvancedCheckbox';

export default AdvancedCheckbox;
