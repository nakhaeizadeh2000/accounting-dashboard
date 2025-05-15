import Swal from 'sweetalert2';
import { ModalOptions, ModalServiceResult, ComponentModalOptions } from '../types/modalType';
import ComponentRenderer from '../components/ComponentRenders';

/**
 * Modal Service - Handles all modal operations
 * Abstracts SweetAlert2 implementation details
 */
class ModalService {
  // Store cleanup functions for component modals
  private componentCleanupFn: (() => void) | null = null;

  /**
   * Show a modal with given options
   * @param options Modal configuration options
   * @returns Modal service result with close method
   */
  show(options: ModalOptions = {}): ModalServiceResult {
    const { onConfirm, onDismiss, ...sweetAlertOptions } = options;

    Swal.fire({ ...sweetAlertOptions }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm(result);
      } else if (result.isDismissed && onDismiss) {
        onDismiss(result);
      }
    });

    return {
      close: () => Swal.close(),
    };
  }

  /**
   * Show a modal with a React component
   * @param options Component modal options
   * @returns Modal service result with close method
   */
  showComponent(options: ComponentModalOptions): ModalServiceResult {
    const {
      component,
      title,
      width = '500px',
      showConfirmButton = true,
      showCancelButton = false,
      confirmButtonText = 'OK',
      cancelButtonText = 'Cancel',
      onConfirm,
      onDismiss,
      customClass = {},
    } = options;

    // Create a container div for the component
    const componentContainer = document.createElement('div');
    componentContainer.className = 'react-component-container';

    // Clean up any previous component renders
    if (this.componentCleanupFn) {
      this.componentCleanupFn();
      this.componentCleanupFn = null;
    }

    // Show the modal with an empty container
    Swal.fire({
      title,
      html: componentContainer,
      width,
      showConfirmButton,
      showCancelButton,
      confirmButtonText,
      cancelButtonText,
      customClass,
      didOpen: () => {
        // Render the component into the container
        this.componentCleanupFn = ComponentRenderer.render(component, componentContainer);
      },
      willClose: () => {
        // Clean up the component when modal closes
        if (this.componentCleanupFn) {
          this.componentCleanupFn();
          this.componentCleanupFn = null;
        }
      },
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm(result);
      } else if (result.isDismissed && onDismiss) {
        onDismiss(result);
      }
    });

    return {
      close: () => Swal.close(),
    };
  }

  /**
   * Close any active modal
   */
  close(): void {
    // Clean up component if one is rendered
    if (this.componentCleanupFn) {
      this.componentCleanupFn();
      this.componentCleanupFn = null;
    }

    Swal.close();
  }

  /**
   * Create a simple confirmation modal
   * @param title Modal title
   * @param text Modal content text
   * @param onConfirm Callback function on confirm
   * @returns Modal service result
   */
  confirm(title: string, text: string, onConfirm?: (result: any) => void): ModalServiceResult {
    return this.show({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      onConfirm,
    });
  }

  /**
   * Create a simple alert modal
   * @param title Modal title
   * @param text Modal content text
   * @returns Modal service result
   */
  alert(title: string, text: string): ModalServiceResult {
    return this.show({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
    });
  }
}

// Create a singleton instance
const modalService = new ModalService();
export default modalService;
