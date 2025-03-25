import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
};

const FailedXmarkIcon: React.FC<IconProps> = ({ width = 16, height = 16 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width.toString()}
      height={height.toString()}
      viewBox="0 0 15 15"
      fill="none"
    >
      <circle cx="7.5" cy="7.5" r="7.5" fill="#F31260" />
      <path
        d="M3.5 11.5C3.5 11.5 10.2999 4.7 11.5 3.5M11.5 11.5C11.5 11.5 5 5 3.5 3.5"
        stroke="white"
        strokeWidth="1.1875"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FailedXmarkIcon;
