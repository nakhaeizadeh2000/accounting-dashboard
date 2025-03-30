import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
};

const XIcon: React.FC<IconProps> = ({ width = 11, height = 10 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width.toString()}
      height={height.toString()}
      viewBox="0 0 11 10"
      fill="none"
      className="text-slate-800 dark:text-slate-200"
    >
      <path
        opacity="0.65"
        d="M9.49915 9L1.5 1M1.50085 9L9.5 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default XIcon;
