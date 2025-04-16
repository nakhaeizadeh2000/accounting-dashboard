import React from 'react';
import Swal, { SweetAlertOptions } from 'sweetalert2';

type Props = {
  options?: SweetAlertOptions;
};

function Modal({ options }: Props) {
  const showAlert = () => {
    Swal.fire({
      title: options?.title,
      text: options?.text,
      icon: options?.icon,
      showCloseButton: options?.showCloseButton || false,
      showConfirmButton: options?.showConfirmButton || true,
      showClass: options?.showClass || {
        popup: 'animate__animated animate__fadeInDown',
        backdrop: 'animate__animated animate__fadeIn',
      },
      hideClass: options?.hideClass || {
        popup: 'animate__animated animate__fadeOutup',
        backdrop: 'animate__animated animate__fadeOut',
      },
      backdrop: options?.backdrop || 'rgba(0, 0, 0, 0.5)',
      allowOutsideClick: options?.allowOutsideClick || false,
      allowEscapeKey: options?.allowEscapeKey || false,
      focusCancel: options?.focusCancel || false,
      focusConfirm: options?.focusConfirm || false,
      preConfirm: options?.preConfirm || (() => Promise.resolve()),
      preDeny: options?.preDeny || (() => Promise.resolve()),
      showCancelButton: options?.showCancelButton || false,
      confirmButtonText: options?.confirmButtonText,
      cancelButtonText: options?.cancelButtonText,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(result.value, 'Confirmed');
      } else if (result.isDismissed) {
        console.log('Cancelled');
      }
    });
  };
  return (
    <>
      <button onClick={showAlert} className="bg-orange-400">
        Show Modal
      </button>
    </>
  );
}

export default Modal;
