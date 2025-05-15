import { useState, useCallback } from 'react';
import { ModalOptions, ModalServiceResult, ComponentModalOptions } from '../types/modalType';
import modalService from '../services/ModalService';

/**
 * Custom hook for using modals in functional components
 * @returns Modal management functions and state
 */
const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState<ModalServiceResult | null>(null);

  /**
   * Open a modal with the provided options
   * @param options Modal configuration options
   */
  const openModal = useCallback((options: ModalOptions = {}) => {
    // Extend options with handlers that track modal state
    const enhancedOptions: ModalOptions = {
      ...options,
      onConfirm: (result) => {
        setIsOpen(false);
        if (options.onConfirm) {
          options.onConfirm(result);
        }
      },
      onDismiss: (result) => {
        setIsOpen(false);
        if (options.onDismiss) {
          options.onDismiss(result);
        }
      },
      didOpen: (popup) => {
        setIsOpen(true);
        if (options.didOpen) {
          options.didOpen(popup);
        }
      },
    };

    const modal = modalService.show(enhancedOptions);
    setCurrentModal(modal);
    return modal;
  }, []);

  /**
   * Open a modal with a React component
   * @param options Component modal options
   */
  const openComponentModal = useCallback((options: ComponentModalOptions) => {
    // Extend options with handlers that track modal state
    const enhancedOptions: ComponentModalOptions = {
      ...options,
      onConfirm: (result) => {
        setIsOpen(false);
        if (options.onConfirm) {
          options.onConfirm(result);
        }
      },
      onDismiss: (result) => {
        setIsOpen(false);
        if (options.onDismiss) {
          options.onDismiss(result);
        }
      },
    };

    setIsOpen(true);
    const modal = modalService.showComponent(enhancedOptions);
    setCurrentModal(modal);
    return modal;
  }, []);

  /**
   * Close the currently open modal if any
   */
  const closeModal = useCallback(() => {
    if (currentModal) {
      currentModal.close();
      setIsOpen(false);
      setCurrentModal(null);
    }
  }, [currentModal]);

  /**
   * Show a confirmation modal
   * @param title Modal title
   * @param text Modal text content
   * @param onConfirm Callback function on confirm
   */
  const confirmModal = useCallback(
    (title: string, text: string, onConfirm?: (result: any) => void) => {
      return openModal({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        onConfirm,
      });
    },
    [openModal],
  );

  /**
   * Show a simple alert modal
   * @param title Modal title
   * @param text Modal text content
   */
  const alertModal = useCallback(
    (title: string, text: string) => {
      return openModal({
        title,
        text,
        icon: 'info',
        confirmButtonText: 'OK',
      });
    },
    [openModal],
  );

  return {
    isOpen,
    openModal,
    openComponentModal,
    closeModal,
    confirmModal,
    alertModal,
  };
};

export default useModal;
