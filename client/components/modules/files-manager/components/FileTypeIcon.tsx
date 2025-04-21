// components/modules/file-manager/components/FileTypeIcon.tsx
import React from 'react';
import { FileTypeIconProps } from '../types';
import { getFileTypeCategory } from '../utils/fileHelpers';

import ImageFileIcon from '@/components/icon/ImageFileIcon';
import AudioFileIcon from '@/components/icon/AudioFileIcon';
import VideoFileIcon from '@/components/icon/VideoFileIcon';
import DocumentFileIcon from '@/components/icon/DocumentFileIcon';
import CompressedFileIcon from '@/components/icon/CompressedFileIcon';
import FolderIcon from '@/components/icon/FolderIcon';

const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileType, className = 'h-8 w-8' }) => {
  // Extract width and height from className if it follows the pattern "h-X w-Y"
  let width = 35;
  let height = 35;

  // Try to extract size from the className
  const heightMatch = className.match(/h-(\d+)/);
  const widthMatch = className.match(/w-(\d+)/);

  if (heightMatch && heightMatch[1]) {
    height = parseInt(heightMatch[1], 10);
  }

  if (widthMatch && widthMatch[1]) {
    width = parseInt(widthMatch[1], 10);
  }

  const category = getFileTypeCategory(fileType);

  switch (category) {
    case 'image':
      return <ImageFileIcon width={width} height={height} />;
    case 'audio':
      return <AudioFileIcon width={width} height={height} />;
    case 'video':
      return <VideoFileIcon width={width} height={height} />;
    case 'document':
      return <DocumentFileIcon width={width} height={height} />;
    case 'compressed':
      return <CompressedFileIcon width={width} height={height} />;
    case 'folder':
      return <FolderIcon width={width} height={height} />;
    default:
      return <DocumentFileIcon width={width} height={height} />; // Default to document for unknown types
  }
};

export default FileTypeIcon;
