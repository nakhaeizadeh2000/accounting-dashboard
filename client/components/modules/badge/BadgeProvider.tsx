'use client';

import React from 'react';
import { BadgeProviderProps } from './types/BadgeTypes';
import DotBadge from './components/DotBadge';
import ContentBadge from './components/ContentBadge';

/**
 * Bridge component that simplifies badge usage by automatically choosing
 * the appropriate badge type based on props
 */
const BadgeProvider: React.FC<BadgeProviderProps> = ({ content, Icon, options }) => {
  // Show dot badge if content is missing or options.showZero is true and content is 0
  const shouldShowDot =
    content === undefined || (options?.showZero && (content === 0 || content === '0'));

  if (shouldShowDot) {
    return <DotBadge Icon={Icon} options={options} />;
  }

  // Otherwise show content badge
  return <ContentBadge content={content} Icon={Icon} options={options} />;
};

export default BadgeProvider;
