import { SweetAlertOptions } from 'sweetalert2';
import modalService from '../services/ModalService';

/**
 * Modal Bridge
 * Creates preset configurations for common use cases to reduce boilerplate
 */
class ModalBridge {
  // Base configurations
  private baseConfig: SweetAlertOptions = {
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    reverseButtons: true,
  };

  // Theme configurations
  private themes = {
    light: {
      background: '#ffffff',
      color: '#545454',
    },
    dark: {
      background: '#1a1a1a',
      color: '#ffffff',
    },
  };

  // Current theme
  private currentTheme: 'light' | 'dark' = 'light';

  /**
   * Set global theme for all modals
   * @param theme Theme name
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
  }

  /**
   * Create options with applied theme and base configuration
   * @param options Modal options
   * @returns Enhanced modal options
   */
  createOptions(options: SweetAlertOptions): SweetAlertOptions {
    const sweetAlertOptions: Omit<SweetAlertOptions, 'input' | 'inputValidator'> = {
      ...this.themes[this.currentTheme],
      ...this.baseConfig,
      ...options,
    };
    return sweetAlertOptions;
  }

  /**
   * Show a success message
   * @param title Success title
   * @param message Success message
   */
  success(title: string, message?: string): void {
    modalService.show(
      this.createOptions({
        title,
        text: message,
        icon: 'success',
      }),
    );
  }

  /**
   * Show an error message
   * @param title Error title
   * @param message Error message
   */
  error(title: string, message?: string): void {
    modalService.show(
      this.createOptions({
        title,
        text: message,
        icon: 'error',
      }),
    );
  }

  /**
   * Show a warning message
   * @param title Warning title
   * @param message Warning message
   */
  warning(title: string, message?: string): void {
    modalService.show(
      this.createOptions({
        title,
        text: message,
        icon: 'warning',
      }),
    );
  }

  /**
   * Create a customized confirmation dialog
   * @param title Dialog title
   * @param message Dialog message
   * @param confirmText Text for confirmation button
   * @param cancelText Text for cancel button
   * @param onConfirm Function to execute on confirmation
   */
  customConfirm(
    title: string,
    message: string,
    confirmText: string = 'Yes',
    cancelText: string = 'No',
    onConfirm?: () => void,
  ): void {
    modalService.show(
      this.createOptions({
        title,
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        preConfirm: onConfirm
          ? () => {
              onConfirm();
            }
          : undefined,
      }),
    );
  }

  /**
   * Show notification that automatically closes
   * @param message Notification message
   * @param duration Duration in milliseconds
   */
  notify(message: string, duration: number = 3000): void {
    modalService.show(
      this.createOptions({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        text: message,
      }),
    );
  }
}

// Create a singleton instance
const modalBridge = new ModalBridge();
export default modalBridge;
