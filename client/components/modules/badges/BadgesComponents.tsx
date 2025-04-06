'use client';

import React, { ComponentType, useEffect, useRef, useState } from 'react';
import Badge, { BadgeProps } from '@mui/material/Badge';
import { IconBaseProps, IconType } from 'react-icons';
import { BsMailbox } from 'react-icons/bs';
import shadows from '@mui/material/styles/shadows';

type BadgesProps = {
  content: number | string;
  Icon: IconType | ComponentType<IconBaseProps>;
  options?: {
    name?: string;
    anchorOriginBadge?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' };
    ClassName?: string;
    colorTypeBadge?: string;
    overlap?: 'circular' | 'rectangular';
    max?: number | string;
    showZero?: boolean;
    animateEnabled?: boolean;
    contentClass?: string;
  };
};

const BadgesComponents = ({ content, Icon, options = {} }: BadgesProps) => {
  const contentSpanRef = useRef<HTMLSpanElement>(null);
  const [contentSpanWidth, setContentSpanWidth] = useState<number>(0);
  useEffect(() => {
    if (contentSpanRef.current) {
      console.log(contentSpanRef, 'width');
      const spanWidth = contentSpanRef.current.offsetWidth;
      setContentSpanWidth(spanWidth + 2);
    }
  }, [content]);

  // Default options to avoid undefined errors
  const {
    max = 99, // Default max value
  } = options;

  return (
    <div>
      <Badge
        badgeContent={
          options?.showZero ? (
            <div className="h-fit w-fit ltr:right-0 rtl:left-0">
              {options?.animateEnabled && (
                <span
                  className={`absolute h-[20px] w-[20px] ${options?.animateEnabled ? 'animate-ping' : ''} rounded-full ltr:-left-[0px] rtl:-right-[0px] ${options?.colorTypeBadge} bottom-[0.05rem] right-[0.3rem] opacity-75`}
                ></span>
              )}
              <span
                className={`relative flex h-[10px] w-[10px] items-center justify-around rounded-full ${options?.colorTypeBadge} p-[0.12rem]`}
              ></span>
            </div>
          ) : (
            <div className="relative bottom-[0.5rem] flex h-fit w-fit flex-row justify-center">
              {options?.animateEnabled && (
                <span
                  className={`absolute ${options?.animateEnabled ? 'animate-ping' : ''} rounded-full ${options?.colorTypeBadge} bottom-[0.01rem] left-auto right-auto top-0 opacity-75`}
                  style={{
                    width: contentSpanWidth ? `${contentSpanWidth}px` : '15px',
                    height: '16px',
                  }}
                ></span>
              )}
              <span
                ref={contentSpanRef}
                className={`absolute flex h-[16px] w-fit items-center justify-around rounded-full ${options?.colorTypeBadge} left-auto right-auto p-[0.12rem]`}
              >
                <p className={`relative top-[0.05rem] ${options?.contentClass}`}>
                  {content > max ? `${max}+` : content}
                </p>
              </span>
            </div>
          )
        }
        anchorOrigin={options?.anchorOriginBadge ?? { vertical: 'top', horizontal: 'left' }}
        aria-label="label"
        className={`${options?.ClassName}`}
        overlap="circular"
      >
        <Icon
          style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          onClick={() => console.log('ehh')}
        />
      </Badge>
    </div>
  );
};

export default BadgesComponents;
