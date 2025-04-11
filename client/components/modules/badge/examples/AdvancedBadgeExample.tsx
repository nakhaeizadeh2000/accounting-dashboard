'use client';

import React, { useState } from 'react';
// import { BadgeProvider } from './components/badge';
import { BsMailbox, BsBell, BsCart, BsChatDots, BsCalendar } from 'react-icons/bs';
import BadgeProvider from '../BadgeProvider';

interface NotificationState {
  messages: number;
  notifications: number;
  cartItems: number;
  chats: number;
  events: number;
}

const AdvancedBadgeExample = () => {
  // State for different notification counts
  const [counts, setCounts] = useState<NotificationState>({
    messages: 5,
    notifications: 12,
    cartItems: 3,
    chats: 101,
    events: 0,
  });

  // Handle notification click and reset count
  const handleReset = (type: keyof NotificationState) => {
    setCounts((prev) => ({
      ...prev,
      [type]: 0,
    }));
  };

  // Increment counts (for demo purposes)
  const incrementCount = (type: keyof NotificationState) => {
    setCounts((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-bold">Notification System</h2>

      <div className="mb-8 flex items-center space-x-8">
        {/* Messages with animated badge */}
        <div className="flex flex-col items-center">
          <BadgeProvider
            content={counts.messages}
            Icon={BsMailbox}
            options={{
              colorTypeBadge: 'bg-blue-500 text-white',
              animateEnabled: counts.messages > 0,
              contentClass: 'text-xs font-bold',
              onClick: () => handleReset('messages'),
            }}
          />
          <span className="mt-2 text-sm">Messages</span>
          <button
            className="mt-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
            onClick={() => incrementCount('messages')}
          >
            Add
          </button>
        </div>

        {/* Notifications with max value and custom position */}
        <div className="flex flex-col items-center">
          <BadgeProvider
            content={counts.notifications}
            Icon={BsBell}
            options={{
              colorTypeBadge: 'bg-red-500 text-white',
              max: 9,
              anchorOriginBadge: { vertical: 'top', horizontal: 'right' },
              animateEnabled: true,
              onClick: () => handleReset('notifications'),
            }}
          />
          <span className="mt-2 text-sm">Alerts</span>
          <button
            className="mt-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700"
            onClick={() => incrementCount('notifications')}
          >
            Add
          </button>
        </div>

        {/* Cart with different position */}
        <div className="flex flex-col items-center">
          <BadgeProvider
            content={counts.cartItems}
            Icon={BsCart}
            options={{
              colorTypeBadge: 'bg-green-500 text-white',
              anchorOriginBadge: { vertical: 'bottom', horizontal: 'right' },
              onClick: () => handleReset('cartItems'),
            }}
          />
          <span className="mt-2 text-sm">Cart</span>
          <button
            className="mt-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700"
            onClick={() => incrementCount('cartItems')}
          >
            Add
          </button>
        </div>

        {/* Chats with max value */}
        <div className="flex flex-col items-center">
          <BadgeProvider
            content={counts.chats}
            Icon={BsChatDots}
            options={{
              colorTypeBadge: 'bg-purple-500 text-white',
              max: 99,
              className: 'ml-2',
              contentClass: 'text-xs font-semibold',
              onClick: () => handleReset('chats'),
            }}
          />
          <span className="mt-2 text-sm">Chats</span>
          <button
            className="mt-1 rounded bg-purple-100 px-2 py-1 text-xs text-purple-700"
            onClick={() => incrementCount('chats')}
          >
            Add
          </button>
        </div>

        {/* Events with showZero option */}
        <div className="flex flex-col items-center">
          <BadgeProvider
            content={counts.events}
            Icon={BsCalendar}
            options={{
              colorTypeBadge: 'bg-amber-500 text-white',
              showZero: true,
              onClick: () => handleReset('events'),
            }}
          />
          <span className="mt-2 text-sm">Events</span>
          <button
            className="mt-1 rounded bg-amber-100 px-2 py-1 text-xs text-amber-700"
            onClick={() => incrementCount('events')}
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">Current State:</h3>
        <pre className="overflow-auto rounded bg-gray-100 p-2 text-sm">
          {JSON.stringify(counts, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AdvancedBadgeExample;
