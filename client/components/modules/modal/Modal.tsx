import React from 'react';
import Swal, { SweetAlertOptions } from 'sweetalert2';

type Props = {
  options?: SweetAlertOptions;
};

function Modal({ options }: Props) {
  const showAlert = () => {
    Swal.fire({ ...options }).then((result) => {
      if (result.isConfirmed) {
        console.log(result.value, 'Confirmed');
        Swal.close();
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
