import Button from '@mui/material/Button';
import { SimpleButtonProps } from '../types/ButtonTypes';

const SimpleButton = ({
  variant = 'contained',
  color = 'primary',
  onClick,
  label,
  endIcon,
  startIcon,
  disabled = false,
  href,
  size = 'medium',
}: SimpleButtonProps) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      color={color}
      disabled={disabled}
      href={href}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
    >
      {label}
    </Button>
  );
};

export default SimpleButton;