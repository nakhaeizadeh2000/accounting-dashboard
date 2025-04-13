import { ReactNode } from 'react';
import { 
  SimpleButtonProps, 
  IconButtonProps, 
  LoadingButtonProps, 
  AdvancedButtonProps,
  ButtonType
} from './types';

/**
 * ButtonFactory provides shorthand methods to create button configurations
 * for use with the ButtonBridge component, reducing boilerplate code.
 */
export class ButtonFactory {
  /**
   * Creates a simple button configuration
   */
  static createSimple(
    label: string, 
    options: Partial<SimpleButtonProps> = {}
  ): { type: ButtonType; props: SimpleButtonProps } {
    return {
      type: 'simple',
      props: {
        label,
        ...options
      }
    };
  }

  /**
   * Creates an icon button configuration
   */
  static createIcon(
    label: string, 
    icon: ReactNode, 
    options: Partial<Omit<IconButtonProps, 'icon'>> = {}
  ): { type: ButtonType; props: IconButtonProps } {
    return {
      type: 'icon',
      props: {
        label,
        icon,
        ...options
      }
    };
  }

  /**
   * Creates a loading button configuration
   */
  static createLoading(
    label: string, 
    loading: boolean, 
    options: Partial<Omit<LoadingButtonProps, 'loading'>> = {}
  ): { type: ButtonType; props: LoadingButtonProps } {
    return {
      type: 'loading',
      props: {
        label,
        loading,
        ...options
      }
    };
  }

  /**
   * Creates an advanced button configuration with tooltip
   */
  static createAdvanced(
    label: string, 
    tooltip: string, 
    options: Partial<Omit<AdvancedButtonProps, 'tooltip'>> = {}
  ): { type: ButtonType; props: AdvancedButtonProps } {
    return {
      type: 'advanced',
      props: {
        label,
        tooltip,
        ...options
      }
    };
  }

  /**
   * Creates a submit button for forms
   */
  static createSubmit(
    label: string = 'Submit', 
    options: Partial<LoadingButtonProps> = {}
  ): { type: ButtonType; props: LoadingButtonProps } {
    return {
      type: 'loading',
      props: {
        label,
        type: 'submit',
        variant: 'contained',
        color: 'primary',
        ...options
      }
    };
  }

  /**
   * Creates a reset button for forms
   */
  static createReset(
    label: string = 'Reset', 
    options: Partial<SimpleButtonProps> = {}
  ): { type: ButtonType; props: SimpleButtonProps } {
    return {
      type: 'simple',
      props: {
        label,
        type: 'reset',
        variant: 'outlined',
        color: 'error',
        ...options
      }
    };
  }

  /**
   * Creates a button that links to a URL
   */
  static createLink(
    label: string, 
    href: string, 
    options: Partial<SimpleButtonProps> = {}
  ): { type: ButtonType; props: SimpleButtonProps } {
    return {
      type: 'simple',
      props: {
        label,
        href,
        target: options.target || '_blank',
        rel: options.rel || 'noopener noreferrer',
        variant: 'text',
        ...options
      }
    };
  }

  /**
   * Creates a delete/danger button
   */
  static createDanger(
    label: string = 'Delete', 
    options: Partial<AdvancedButtonProps> = {}
  ): { type: ButtonType; props: AdvancedButtonProps } {
    return {
      type: 'advanced',
      props: {
        label,
        color: 'error',
        variant: 'contained',
        tooltip: options.tooltip || 'This action cannot be undone',
        ...options
      }
    };
  }

  /**
   * Creates a button with confirmation dialog via tooltip
   */
  static createConfirm(
    label: string, 
    confirmMessage: string,
    options: Partial<AdvancedButtonProps> = {}
  ): { type: ButtonType; props: AdvancedButtonProps } {
    return {
      type: 'advanced',
      props: {
        label,
        tooltip: confirmMessage,
        tooltipPlacement: 'top',
        ...options
      }
    };
  }
}