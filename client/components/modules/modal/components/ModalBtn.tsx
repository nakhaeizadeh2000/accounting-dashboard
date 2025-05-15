import { FC } from 'react';
import { ModalButtonProps } from '../types/modalType';
import modalService from '../services/ModalService';

/**
 * Modal Button Component
 * A button that opens a modal when clicked
 */
const ModalButton: FC<ModalButtonProps> = ({
  options = {},
  buttonText = 'Show Modal',
  className = 'bg-orange-400',
  children,
}) => {
  const handleClick = () => {
    modalService.show(options);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children || buttonText}
    </button>
  );
};

export default ModalButton;
