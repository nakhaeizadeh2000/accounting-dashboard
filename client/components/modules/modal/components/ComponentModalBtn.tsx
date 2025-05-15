import { FC } from 'react';
import { ComponentModalButtonProps } from '../types/modalType';
import modalService from '../services/ModalService';

/**
 * Component Modal Button
 * A button that opens a modal with a React component when clicked
 */
const ComponentModalButton: FC<ComponentModalButtonProps> = ({
  options,
  buttonText = 'Open Component Modal',
  className = 'bg-blue-500 text-white px-4 py-2 rounded',
  children,
}) => {
  const handleClick = () => {
    modalService.showComponent(options);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children || buttonText}
    </button>
  );
};

export default ComponentModalButton;
