// components/modules/file-manager/components/LoadingState.tsx
import React from 'react';
import { LoadingStateProps } from '../types';

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading files...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      <p className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">{message}</p>
    </div>
  );
};

export default LoadingState;
