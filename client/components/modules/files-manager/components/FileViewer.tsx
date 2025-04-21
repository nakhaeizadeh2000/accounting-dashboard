import React, { useState, useEffect } from 'react';
import { FileViewerProps } from '../types';

/**
 * A component that handles viewing files from MinIO, with proper error handling
 * and direct download fallback through API for all file types
 */
const FileViewer: React.FC<FileViewerProps> = ({
  fileUrl,
  fileType,
  fileName,
  bucket,
  fileId,
  className = 'w-full h-full object-contain',
  fallbackSize = 150,
}) => {
  // Possible status values for the file loading process
  type FileStatus = 'loading' | 'success' | 'trying-direct' | 'error';

  const [status, setStatus] = useState<FileStatus>('loading');
  const [directUrl, setDirectUrl] = useState<string>('');

  useEffect(() => {
    if (!fileUrl) {
      setStatus('error');
      return;
    }

    // First attempt - try to use the pre-signed URL
    const checkUrl = (): void => {
      // For images we can test with an Image object
      if (fileType && fileType.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          setStatus('success');
        };
        img.onerror = () => {
          // If pre-signed URL fails, try direct download through API
          setStatus('trying-direct');
          // Create direct download URL
          const direct = `/api/files/download/${bucket}/${fileId}?direct=true`;
          setDirectUrl(direct);
        };
        img.src = fileUrl;
      } else {
        // For non-images, try a HEAD request to test the URL
        fetch(fileUrl, { method: 'HEAD' })
          .then((response) => {
            if (response.ok) {
              setStatus('success');
            } else {
              // If pre-signed URL fails, try direct download through API
              setStatus('trying-direct');
              // Create direct download URL
              const direct = `/api/files/download/${bucket}/${fileId}?direct=true`;
              setDirectUrl(direct);
            }
          })
          .catch(() => {
            // If pre-signed URL fails, try direct download through API
            setStatus('trying-direct');
            // Create direct download URL
            const direct = `/api/files/download/${bucket}/${fileId}?direct=true`;
            setDirectUrl(direct);
          });
      }
    };

    checkUrl();
  }, [fileUrl, fileType, bucket, fileId]);

  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (status === 'trying-direct' || status === 'success') {
    // If we have a direct URL or the original URL worked
    const src = status === 'trying-direct' ? directUrl : fileUrl;

    if (fileType && fileType.startsWith('image/')) {
      return <img src={src} alt={fileName} className={className} />;
    }

    if (fileType && fileType.startsWith('video/')) {
      return (
        <video controls className={className}>
          <source src={src} type={fileType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (fileType && fileType.startsWith('audio/')) {
      return (
        <audio controls className={className}>
          <source src={src} type={fileType} />
          Your browser does not support the audio tag.
        </audio>
      );
    }

    // For other file types like PDFs, documents, etc.
    // Just provide an icon with download link
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={fallbackSize / 2}
          height={fallbackSize / 2}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <p className="mt-2 text-sm text-gray-500">{fileName || 'File preview'}</p>
        <a
          href={src}
          className="mt-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
        >
          Download
        </a>
      </div>
    );
  }

  // If we reached here, it's an error
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={fallbackSize / 2}
        height={fallbackSize / 2}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-400"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p className="mt-2 text-sm text-gray-500">Failed to load file</p>
      <a
        href={`/api/files/download/${bucket}/${fileId}?direct=true`}
        className="mt-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
      >
        Download Directly
      </a>
    </div>
  );
};

export default FileViewer;
