// components/modules/file-manager/components/EmptyState.tsx
import React from 'react';
import { EmptyStateProps } from '../types';
import FolderIcon from '@/components/icon/FolderIcon';

const EmptyState: React.FC<EmptyStateProps> = ({ message = 'No files found' }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <FolderIcon height={40} width={40} />
      </div>
      <h3 className="mb-1 text-lg font-medium text-gray-900">No files</h3>
      <p className="max-w-md text-center text-sm text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;
