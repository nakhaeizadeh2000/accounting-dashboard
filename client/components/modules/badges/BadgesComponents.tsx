'use client';

import React from 'react';
import Badge, { BadgeProps } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { LuShoppingCart } from 'react-icons/lu';
import { IconType } from 'react-icons';

type Props = {
  options?: {
    name?: string;
    Icon: IconType;
  };
};
const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    left: 0,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const BadgesComponents = (props: Props) => {
  return (
    <div>
      <IconButton aria-label="cart">
        <StyledBadge badgeContent={4} color="secondary">
          <LuShoppingCart />
        </StyledBadge>
      </IconButton>
    </div>
  );
};

export default BadgesComponents;
