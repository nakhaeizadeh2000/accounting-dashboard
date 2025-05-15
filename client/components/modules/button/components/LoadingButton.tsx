import LoadingButton from '@mui/lab/LoadingButton';
import { LoadingButtonProps } from '../types/ButtonTypes';

const LoadingButtonComponent = ({
  variant = 'contained',
  color = 'primary',
  onClick,
  label,
  endIcon,
  startIcon,
  disabled = false,
  href,
  size = 'medium',
  loading = false,
  loadingPosition = 'start',
}: LoadingButtonProps) => {
  return (
    <LoadingButton
      loading={loading}
      loadingPosition={loadingPosition}
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
    </LoadingButton>
  );
};

export default LoadingButtonComponent;
