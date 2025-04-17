'use client';

import React from 'react';
import { ContentBadgeProps } from '../types/BadgeTypes';
import BaseBadge from './BaseBadge';
import { formatBadgeContent, mergeBadgeOptions } from '../utils/badgeUtils';
import useBadgeSize from '../hooks/useBadgeSize';

/**
 * Badge component that displays numerical or text content
 */
const ContentBadge: React.FC<ContentBadgeProps> = ({ content, Icon, options: userOptions }) => {
  const options = mergeBadgeOptions(userOptions);
  const { contentRef, contentWidth } = useBadgeSize(content);

  // Format content based on max value
  const formattedContent = formatBadgeContent(content, options.max);

  // Render badge content with text
  const contentBadgeContent = (
    <div className="relative bottom-[0.5rem] flex h-fit w-fit flex-row justify-center">
      {options.animateEnabled && (
        <span
          className={`absolute ${
            options.animateEnabled ? 'animate-ping' : ''
          } rounded-full ${options.colorTypeBadge} bottom-[0.01rem] left-auto right-auto top-0 opacity-75`}
          style={{
            width: contentWidth ? `${contentWidth}px` : '15px',
            height: '16px',
          }}
        ></span>
      )}
      <span
        ref={contentRef}
        className={`absolute flex h-[16px] w-fit items-center justify-around rounded-full ${
          options.colorTypeBadge
        } left-auto right-auto p-[0.25rem]`}
      >
        <p className={`relative top-[0.05rem] ${options.contentClass}`}>{formattedContent}</p>
      </span>
    </div>
  );

  return <BaseBadge Icon={Icon} badgeContent={contentBadgeContent} options={options} />;
};

export default ContentBadge;
