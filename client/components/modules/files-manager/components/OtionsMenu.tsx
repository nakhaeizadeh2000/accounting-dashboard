// components/modules/file-manager/components/OptionsMenu.tsx
import React, { useRef } from 'react';
import { OptionsMenuProps } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';
import XIcon from '@/components/icon/XIcon';

// This component uses emojis as placeholders since we don't have all the required icons
// You should create/add these icons to your project if you don't have them:
// - EyeIcon (for preview)
// - DownloadIcon (for download)
// - TagIcon (for managing tags)
// - TrashIcon (for delete)

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  isOpen,
  onClose,
  onView,
  onDownload,
  onDelete,
  onTags,
  position = 'top-right',
  additionalOptions,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, onClose);

  if (!isOpen) return null;

  // Position classes
  const positionClasses = {
    'top-right': 'origin-top-right right-0 mt-2',
    'bottom-right': 'origin-bottom-right right-0 mb-2 bottom-full',
    'bottom-left': 'origin-bottom-left left-0 mb-2 bottom-full',
    'top-left': 'origin-top-left left-0 mt-2',
  };

  return (
    <div
      ref={menuRef}
      className={`absolute z-20 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${positionClasses[position]}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute right-2 top-2">
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          aria-label="Close menu"
        >
          <XIcon width={16} height={16} />
        </button>
      </div>

      <div className="px-1 py-4" role="menu" aria-orientation="vertical">
        <div className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-gray-500">
          File Options
        </div>

        <button
          onClick={onView}
          className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
        >
          <span className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500">👁️</span>
          <span>Preview</span>
        </button>

        <button
          onClick={onDownload}
          className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
        >
          <span className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500">⬇️</span>
          <span>Download</span>
        </button>

        <button
          onClick={onTags}
          className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
        >
          <span className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500">🏷️</span>
          <span>Manage Tags</span>
        </button>

        {additionalOptions}

        <div className="my-2 border-t border-gray-100"></div>

        <button
          onClick={onDelete}
          className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          role="menuitem"
        >
          <span className="mr-3 h-5 w-5 flex-shrink-0 text-red-500">🗑️</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default OptionsMenu;
