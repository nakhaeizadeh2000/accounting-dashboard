'use client';

import React from 'react';

import { BsMailbox, BsBell, BsCart } from 'react-icons/bs';
import BadgeProvider from '../BadgeProvider';

const SimpleBadgeExample = () => {
  return (
    <div className="flex items-center space-x-8 p-4">
      {/* Simple notification dot */}
      <BadgeProvider
        Icon={BsBell}
        options={{
          colorTypeBadge: 'bg-red-500 text-white',
        }}
      />

      {/* Message count badge */}
      <BadgeProvider
        content="5"
        Icon={BsMailbox}
        options={{
          colorTypeBadge: 'bg-blue-500 text-white',
          onClick: () => console.log('Messages clicked'),
        }}
      />

      {/* Cart item count badge */}
      <BadgeProvider
        content={12}
        Icon={BsCart}
        options={{
          colorTypeBadge: 'bg-green-500 text-white',
          anchorOriginBadge: { vertical: 'bottom', horizontal: 'right' },
          onClick: () => console.log('Cart clicked'),
        }}
      />
    </div>
  );
};

export default SimpleBadgeExample;
