'use client';

import React, { useState, useEffect } from 'react';
import { BsBell, BsMailbox, BsChatDots } from 'react-icons/bs';
import DotBadge from '../components/DotBadge';
import AnimatedBadge from '../components/AnimatedBadge';

const AnimatedBadgeExample = () => {
  const [messageCount, setMessageCount] = useState(0);
  const [hasNotification, setHasNotification] = useState(false);

  // Simulate new messages arriving every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageCount((prev) => prev + 1);
      setHasNotification(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Reset notification when clicked
  const handleNotificationClick = () => {
    setHasNotification(false);
  };

  // Reset message count when clicked
  const handleMessageClick = () => {
    setMessageCount(0);
  };

  return (
    <div className="flex items-center space-x-8 p-4">
      {/* Notification bell with animated dot badge */}
      <div className="flex flex-col items-center">
        <DotBadge
          Icon={BsBell}
          options={{
            colorTypeBadge: 'bg-red-500',
            animateEnabled: hasNotification,
            onClick: handleNotificationClick,
          }}
        />
        <span className="mt-2 text-sm">Notifications</span>
        <span className="text-xs text-gray-500">
          {hasNotification ? 'New notification!' : 'No new notifications'}
        </span>
      </div>

      {/* Message count with built-in animation */}
      <div className="flex flex-col items-center">
        <AnimatedBadge
          content={messageCount}
          Icon={BsMailbox}
          options={{
            colorTypeBadge: 'bg-blue-500 text-white',
            onClick: handleMessageClick,
          }}
        />
        <span className="mt-2 text-sm">Messages</span>
        <span className="text-xs text-gray-500">
          {messageCount} unread {messageCount === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Chat badge with controlled animation */}
      <div className="flex flex-col items-center">
        <AnimatedBadge
          content="Live"
          Icon={BsChatDots}
          options={{
            colorTypeBadge: 'bg-green-500 text-white',
            contentClass: 'text-xs font-bold',
          }}
        />
        <span className="mt-2 text-sm">Chat</span>
        <span className="text-xs text-gray-500">Active conversation</span>
      </div>
    </div>
  );
};

export default AnimatedBadgeExample;
