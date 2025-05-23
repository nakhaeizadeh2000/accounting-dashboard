import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
};

const AudioFileIcon: React.FC<IconProps> = ({ width = 35, height = 35 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width.toString()}
      height={height.toString()}
      viewBox="0 0 40 40"
      fill="none"
    >
      <g clipPath="url(#clip0_86_1070)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.57031 0H24L36 12V34.7926C36 37.6712 33.5088 40 30.4403 40H9.57031C6.49114 40 4 37.6712 4 34.7926V5.20738C3.99995 2.32883 6.49108 0 9.57031 0Z"
          fill="#C20E4D"
        />
        <path
          d="M24 8.16406V0L36 12H28.0171C24.4248 12 24 9.47141 24 8.16406Z"
          fill="white"
          fillOpacity="0.3"
        />
        <path
          d="M18 22.8123V22.6248C18 22.161 18.3125 21.781 18.7575 21.6688L24.2134 20.2101C24.3059 20.1853 24.4028 20.1822 24.4967 20.2008C24.5906 20.2194 24.6789 20.2594 24.7549 20.3176C24.8309 20.3758 24.8926 20.4506 24.935 20.5364C24.9775 20.6222 24.9998 20.7166 25 20.8123V21.4998"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 25.248V27.748C25 28.1827 24.7209 28.5477 24.3125 28.6855L23.625 28.9355C22.8156 29.208 22 28.6099 22 27.748C21.9981 27.5266 22.0668 27.3104 22.196 27.1306C22.3252 26.9508 22.5083 26.8168 22.7188 26.748L24.3125 26.1808C24.7209 26.0433 25 25.6827 25 25.248ZM25 25.248V17.8124C24.9998 17.7646 24.9886 17.7174 24.9673 17.6746C24.9459 17.6317 24.9151 17.5944 24.877 17.5654C24.839 17.5364 24.7948 17.5165 24.7478 17.5072C24.7009 17.498 24.6524 17.4997 24.6062 17.5121L18.375 19.1874C18.2663 19.2181 18.1707 19.2837 18.103 19.374C18.0352 19.4644 17.999 19.5745 18 19.6874V26.7499M18 26.7499C18 27.1846 17.7209 27.5499 17.3125 27.6874L15.6875 28.2499C15.2537 28.3962 15 28.788 15 29.2499C15 30.1118 15.8288 30.7046 16.625 30.4374L17.3125 30.1874C17.7209 30.0499 18 29.6849 18 29.2499V26.7499Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_86_1070">
          <rect width={width.toString()} height={height.toString()} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default AudioFileIcon;
