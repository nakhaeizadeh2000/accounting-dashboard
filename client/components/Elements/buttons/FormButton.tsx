'use client';

import { CSSProperties, ReactNode } from 'react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import ButtonLoading from '../loadings/ButtonLoading';

type FormButtonOptions = {
  isLoading: boolean;
  loadingIconColor?: string;
  label: ReactNode;
  Icon?: IconType;
  loadingText?: ReactNode;
  disabled?: boolean;
  visible?: boolean;
  className?: string;
  style?: CSSProperties;
};

const FormButton = ({
  isLoading,
  label,
  Icon,
  loadingIconColor,
  loadingText,
  disabled = false,
  visible = true,
  className = '',
  style = {},
}: FormButtonOptions) => {
  return (
    visible && (
      <motion.button
        type="submit"
        disabled={isLoading || disabled}
        className={`w-full rounded-md px-6 py-2 text-sm font-medium ${className}`}
        style={{ ...style }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={spring}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            {<ButtonLoading colorClassName={loadingIconColor} />}
            {loadingText && loadingText}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            {Icon && <Icon className="text-sm font-medium" />}
            {label}
          </div>
        )}
      </motion.button>
    )
  );
};

export default FormButton;

const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
};
