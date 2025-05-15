import { useState, useCallback, ReactNode } from 'react';
import { ButtonFactory } from '../utils/ButtonFactory';
import {
  SimpleButtonProps,
  IconButtonProps,
  LoadingButtonProps,
  AdvancedButtonProps,
  ButtonType,
} from '../types/types';

/**
 * Hook for creating a loading button with built-in loading state management
 */
export const useLoadingButton = (
  label: string,
  options: Partial<Omit<LoadingButtonProps, 'loading'>> = {},
  loadingDuration?: number,
) => {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(
    async (callback?: () => Promise<void> | void) => {
      setLoading(true);

      try {
        if (callback) {
          await callback();
        }
      } catch (error) {
        console.error('Error in loading button callback:', error);
      } finally {
        if (loadingDuration) {
          setTimeout(() => setLoading(false), loadingDuration);
        } else {
          setLoading(false);
        }
      }
    },
    [loadingDuration],
  );

  const buttonProps = ButtonFactory.createLoading(label, loading, {
    ...options,
    onClick: options.onClick
      ? () => handleClick(options.onClick as () => void)
      : () => handleClick(),
  });

  return {
    buttonProps,
    loading,
    setLoading,
    handleClick,
  };
};

/**
 * Hook for creating a form submission button
 */
export const useSubmitButton = (
  label: string = 'Submit',
  options: Partial<LoadingButtonProps> = {},
) => {
  const { buttonProps, loading, setLoading, handleClick } = useLoadingButton(label, {
    type: 'submit',
    variant: 'contained',
    color: 'primary',
    ...options,
  });

  return {
    buttonProps,
    loading,
    setLoading,
    handleClick,
  };
};

/**
 * Hook for creating a button with confirmation dialog
 */
export const useConfirmButton = (
  label: string,
  confirmMessage: string,
  onConfirm: () => void,
  options: Partial<SimpleButtonProps> = {},
) => {
  const handleConfirmClick = useCallback(() => {
    if (window.confirm(confirmMessage)) {
      onConfirm();
    }
  }, [confirmMessage, onConfirm]);

  const buttonProps = ButtonFactory.createSimple(label, {
    ...options,
    onClick: handleConfirmClick,
  });

  return {
    buttonProps,
    handleConfirmClick,
  };
};

/**
 * Hook for creating a set of form buttons (submit + reset)
 */
export const useFormButtons = (
  submitLabel: string = 'Submit',
  resetLabel: string = 'Reset',
  submitOptions: Partial<LoadingButtonProps> = {},
  resetOptions: Partial<SimpleButtonProps> = {},
) => {
  const {
    buttonProps: submitButtonProps,
    loading,
    setLoading,
    handleClick,
  } = useLoadingButton(submitLabel, {
    type: 'submit',
    variant: 'contained',
    color: 'primary',
    ...submitOptions,
  });

  const resetButtonProps = ButtonFactory.createReset(resetLabel, resetOptions);

  return {
    submitButtonProps,
    resetButtonProps,
    loading,
    setLoading,
    handleClick,
  };
};
