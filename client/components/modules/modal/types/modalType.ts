import { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import React from 'react';

// Base modal options - extends SweetAlertOptions via intersection type
export type ModalOptions = SweetAlertOptions & {
  onConfirm?: (result: SweetAlertResult) => void;
  onDismiss?: (result: SweetAlertResult) => void;
};

// Component modal options
export interface ComponentModalOptions {
  title?: string;
  component: React.ReactNode;
  width?: string | number;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: (result: SweetAlertResult) => void;
  onDismiss?: (result: SweetAlertResult) => void;
  customClass?: {
    container?: string;
    popup?: string;
    header?: string;
    title?: string;
    closeButton?: string;
    icon?: string;
    image?: string;
    htmlContainer?: string;
    input?: string;
    inputLabel?: string;
    validationMessage?: string;
    actions?: string;
    confirmButton?: string;
    denyButton?: string;
    cancelButton?: string;
    loader?: string;
    footer?: string;
  };
}

// Button props
export interface ModalButtonProps {
  options?: ModalOptions;
  buttonText?: string;
  className?: string;
  children?: React.ReactNode;
}

// Component Button props
export interface ComponentModalButtonProps {
  options: ComponentModalOptions;
  buttonText?: string;
  className?: string;
  children?: React.ReactNode;
}

// Modal service result
export interface ModalServiceResult {
  close: () => void;
}
