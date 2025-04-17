'use client';

import React from 'react';
import { ContentBadgeProps } from '../types/BadgeTypes';
import ContentBadge from './ContentBadge';
import { mergeBadgeOptions } from '../utils/badgeUtils';

/**
 * Animated badge component that extends ContentBadge with animation enabled by default
 */
const AnimatedBadge: React.FC<ContentBadgeProps> = ({ content, Icon, options: userOptions }) => {
  // Merge options and force animation enabled
  const options = mergeBadgeOptions({
    ...userOptions,
    animateEnabled: true,
  });

  return <ContentBadge content={content} Icon={Icon} options={options} />;
};

export default AnimatedBadge;
