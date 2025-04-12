import Button from '@mui/material/Button';
import React from 'react';
import { IconType } from 'react-icons';

type Props = {
  options: {
    variant: 'contained' | 'outlined' | 'text';
    color: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    onClick?: () => void;
    labelBtn: string;
    endIconBtn?: React.ReactNode;
    startIconBtn?: React.ReactNode;
    disabled?: boolean;
    href?: string;
    sizeBtn?: 'small' | 'medium' | 'large';
  };
};

const ButtonComponent = ({ options }: Props) => {
  const hrefBtn = () => {
    if (!options.href) {
      return options?.href;
    }
  };
  return (
    <>
      <div>
        <Button
          variant={options?.variant}
          onClick={options?.onClick}
          color={options?.color}
          disabled={options?.disabled}
          href={hrefBtn()}
          size={options?.sizeBtn}
          startIcon={options?.startIconBtn}
          endIcon={options?.endIconBtn}
        >
          {options?.labelBtn}
        </Button>
      </div>
    </>
  );
};

export default ButtonComponent;
