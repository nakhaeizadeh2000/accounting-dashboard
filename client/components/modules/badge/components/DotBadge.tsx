'use client';

import React from 'react';
import { DotBadgeProps } from '../types/BadgeTypes';
import BaseBadge from './BaseBadge';
import { mergeBadgeOptions } from '../utils/badgeUtils';

/**
 * Simple dot badge indicator without text content
 */
const DotBadge: React.FC<DotBadgeProps> = ({ Icon, options: userOptions }) => {
  const options = mergeBadgeOptions(userOptions);

  // Render badge content as a simple dot
  const dotBadgeContent = (
    <div className="h-fit w-fit ltr:right-0 rtl:left-0">
      {options.animateEnabled && (
        <span
          className={`absolute h-[20px] w-[20px] ${
            options.animateEnabled ? 'animate-ping' : ''
          } rounded-full ltr:-left-[0px] rtl:-right-[0px] ${
            options.colorTypeBadge
          } bottom-[0.05rem] right-[0.3rem] opacity-75`}
        ></span>
      )}
      <span
        className={`relative flex h-[10px] w-[10px] items-center justify-around rounded-full ${
          options.colorTypeBadge
        } p-[0.25rem]`}
      ></span>
    </div>
  );

  return <BaseBadge Icon={Icon} badgeContent={dotBadgeContent} options={options} />;
};

export default DotBadge;
