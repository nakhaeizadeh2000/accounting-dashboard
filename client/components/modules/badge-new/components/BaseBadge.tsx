'use client';

import React from 'react';
import Badge from '@mui/material/Badge';
import { BaseBadgeProps } from '../types/BadgeTypes';
import { mergeBadgeOptions } from '../utils/badgeUtils';

/**
 * Base badge component that wraps MUI Badge with our custom options
 */
const BaseBadge: React.FC<BaseBadgeProps> = ({ Icon, badgeContent, options: userOptions }) => {
  const options = mergeBadgeOptions(userOptions);

  return (
    <div>
      <Badge
        badgeContent={badgeContent}
        anchorOrigin={options.anchorOriginBadge}
        aria-label={options.name || 'badge'}
        className={options.className}
        overlap={options.overlap}
      >
        <Icon
          style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          onClick={options.onClick}
        />
      </Badge>
    </div>
  );
};

export default BaseBadge;
