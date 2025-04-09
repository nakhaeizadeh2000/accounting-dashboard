import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
};

const AddFileIcon: React.FC<IconProps> = ({ width = 36, height = 36 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width.toString()}
      height={height.toString()}
      viewBox="0 0 36 36"
      fill="none"
    >
      <path
        d="M20.5834 3.1665H21.0152C26.1788 3.1665 28.7606 3.1665 30.5535 4.42974C31.0672 4.79168 31.5233 5.22092 31.9078 5.70441C33.25 7.3919 33.25 9.82182 33.25 14.6817V18.712C33.25 23.4036 33.25 25.7495 32.5076 27.6231C31.3139 30.6351 28.7896 33.0109 25.5893 34.1344C23.5986 34.8332 21.1062 34.8332 16.1213 34.8332C13.2727 34.8332 11.8485 34.8332 10.7109 34.4339C8.88221 33.7919 7.43973 32.4343 6.75765 30.7131C6.33337 29.6425 6.33337 28.302 6.33337 25.621V18.9998"
        stroke="#338EF7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33.25 19C33.25 21.9148 30.887 24.2778 27.9722 24.2778C26.918 24.2778 25.6752 24.0931 24.6503 24.3677C23.7396 24.6117 23.0283 25.323 22.7843 26.2337C22.5097 27.2586 22.6944 28.5014 22.6944 29.5556C22.6944 32.4704 20.3315 34.8333 17.4166 34.8333"
        stroke="#338EF7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.4167 9.49984L4.75 9.49984M11.0833 3.1665V15.8332"
        stroke="#338EF7"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AddFileIcon;
