// components/modules/file-manager/components/FileTags.tsx
import React from 'react';
import { FileTagsProps } from '../types';
import { getTagColorClass } from '../utils/tagHelpers';

const FileTags: React.FC<FileTagsProps> = ({ tags = [], limit = 2, size = 'md' }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Size classes for the tags
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
  };

  const visibleTags = tags.slice(0, limit);
  const remainingCount = tags.length - limit;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map((tag) => {
        const colorClasses = getTagColorClass(tag.color || 'gray');

        return (
          <span
            key={tag.id}
            className={`inline-flex items-center rounded font-medium ${colorClasses.bg} ${colorClasses.text} ${sizeClasses[size]}`}
          >
            {tag.name}
          </span>
        );
      })}

      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center rounded bg-gray-100 font-medium text-gray-700 ${sizeClasses[size]}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default FileTags;
