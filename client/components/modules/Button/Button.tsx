import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import React from 'react';
import { BsMailbox } from 'react-icons/bs';

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
    BtnType: 'iconBtn' | 'simpleBtn' | 'loadingBtn';
    loading?: boolean;
    loadingPosition?: 'start' | 'end';
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
        {options?.BtnType === 'simpleBtn' && (
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
        )}
        {options?.BtnType === 'iconBtn' && (
          <IconButton aria-label={options?.labelBtn} size={options?.sizeBtn} color={options?.color}>
            <BsMailbox />
          </IconButton>
        )}
        {options?.BtnType === 'loadingBtn' && (
          <LoadingButton
            loading={options?.loading}
            loadingPosition={options?.loadingPosition}
            variant={options?.variant}
            onClick={options?.onClick}
            color={options?.color}
            disabled={options?.disabled}
            href={hrefBtn()}
            size={options?.sizeBtn}
            startIcon={options?.startIconBtn}
            endIcon={options?.endIconBtn}
          >
            heloo
          </LoadingButton>
        )}
      </div>
    </>
  );
};

export default ButtonComponent;
