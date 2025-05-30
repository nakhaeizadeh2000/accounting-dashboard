import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
};

const DocumentFileIcon: React.FC<IconProps> = ({ width = 35, height = 35 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width.toString()}
      height={height.toString()}
      viewBox="0 0 40 40"
      fill="none"
    >
      <g clipPath="url(#clip0_86_1115)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.57031 0H24L36 12V34.7926C36 37.6712 33.5088 40 30.4403 40H9.57031C6.49114 40 4 37.6712 4 34.7926V5.20738C3.99995 2.32883 6.49108 0 9.57031 0Z"
          fill="#006FEE"
        />
        <path
          d="M24 8.16406V0L36 12H28.0171C24.4248 12 24 9.47141 24 8.16406Z"
          fill="white"
          fillOpacity="0.3"
        />
        <path
          d="M25 22.9141V29C25 29.3978 24.842 29.7794 24.5607 30.0607C24.2794 30.342 23.8978 30.5 23.5 30.5H16.5C16.1022 30.5 15.7206 30.342 15.4393 30.0607C15.158 29.7794 15 29.3978 15 29V19C15 18.6022 15.158 18.2206 15.4393 17.9393C15.7206 17.658 16.1022 17.5 16.5 17.5H19.5859C19.8511 17.5 20.1053 17.6054 20.2928 17.7928L24.7072 22.2072C24.8946 22.3947 25 22.6489 25 22.9141Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 17.75V21.5C20 21.7652 20.1054 22.0196 20.2929 22.2071C20.4804 22.3946 20.7348 22.5 21 22.5H24.75"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 25H22.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 27.5H22.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_86_1115">
          <rect width="40" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default DocumentFileIcon;
