export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function truncateFilename(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) return filename;

  const extension = getFileExtension(filename);
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));

  if (nameWithoutExtension.length <= maxLength - 3 - extension.length) {
    return filename;
  }

  return `${nameWithoutExtension.substring(0, maxLength - 3 - extension.length)}...${extension}`;
}

export function getFileTypeCategory(
  fileType: string,
): 'image' | 'audio' | 'video' | 'document' | 'compressed' | 'folder' | 'other' {
  if (fileType === 'directory' || fileType === 'folder') {
    return 'folder';
  } else if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType.startsWith('audio/')) {
    return 'audio';
  } else if (fileType.startsWith('video/')) {
    return 'video';
  } else if (
    fileType.includes('pdf') ||
    fileType.includes('document') ||
    fileType.includes('text/') ||
    fileType.includes('spreadsheet') ||
    fileType.includes('presentation') ||
    fileType.includes('excel') ||
    fileType.includes('word') ||
    fileType.includes('powerpoint')
  ) {
    return 'document';
  } else if (
    fileType.includes('zip') ||
    fileType.includes('rar') ||
    fileType.includes('tar') ||
    fileType.includes('7z') ||
    fileType.includes('compressed')
  ) {
    return 'compressed';
  } else {
    return 'other';
  }
}
