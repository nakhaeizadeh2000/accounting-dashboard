import { IconButton as MuiIconButton } from '@mui/material';
import { IconButtonProps } from '../types/ButtonTypes';

const IconButtonComponent = ({
  color = 'primary',
  onClick,
  label,
  disabled = false,
  size = 'medium',
  icon,
}: IconButtonProps) => {
  return (
    <MuiIconButton
      aria-label={label}
      size={size}
      color={color}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </MuiIconButton>
  );
};

export default IconButtonComponent;