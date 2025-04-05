import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
};

const ImageFileIcon: React.FC<IconProps> = ({ width = 35, height = 35 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width.toString()}
      height={height.toString()}
      viewBox="0 0 40 40"
      fill="none"
    >
      <g clipPath="url(#clip0_86_1043)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.57031 0H24L36 12V34.7926C36 37.6712 33.5088 40 30.4403 40H9.57031C6.49114 40 4 37.6712 4 34.7926V5.20738C3.99995 2.32883 6.49108 0 9.57031 0Z"
          fill="#7828C8"
        />
        <path
          d="M24.0257 8.16V0L36 12H28.0171C24.4248 12 23.8593 9.44 24.0257 8.16Z"
          fill="white"
          fillOpacity="0.3"
        />
        <path
          d="M25 18.5H15C14.1716 18.5 13.5 19.1716 13.5 20V28C13.5 28.8284 14.1716 29.5 15 29.5H25C25.8284 29.5 26.5 28.8284 26.5 28V20C26.5 19.1716 25.8284 18.5 25 18.5Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M22.5 22.5C23.0523 22.5 23.5 22.0523 23.5 21.5C23.5 20.9477 23.0523 20.5 22.5 20.5C21.9477 20.5 21.5 20.9477 21.5 21.5C21.5 22.0523 21.9477 22.5 22.5 22.5Z"
          stroke="white"
          strokeWidth="1.5"
          strokeMiterlimit="10"
        />
        <path
          d="M21.5 26.4956L18.6669 23.6678C18.4866 23.4876 18.2443 23.383 17.9895 23.3754C17.7347 23.3679 17.4866 23.4579 17.2959 23.6272L13.5 27.0022"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 29.5021L22.8544 25.6477C23.0306 25.4711 23.2666 25.3668 23.5158 25.3552C23.7651 25.3436 24.0097 25.4257 24.2016 25.5852L26.5 27.5021"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_86_1043">
          <rect width="40" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ImageFileIcon;
