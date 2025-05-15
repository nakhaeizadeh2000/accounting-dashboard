import { useEffect, useState, useRef, RefObject } from 'react';
import { BadgeContent } from '../types/BadgeTypes';

/**
 * Custom hook for measuring badge content size
 * @param content Badge content to measure
 * @returns Object containing ref and measured width
 */
export const useBadgeSize = (content: BadgeContent) => {
  const contentRef = useRef<HTMLSpanElement>(null);
  const [contentWidth, setContentWidth] = useState<number>(0);

  useEffect(() => {
    // Only measure if the element is available in the DOM
    if (contentRef.current) {
      const spanWidth = contentRef.current.offsetWidth;
      // Add a small padding to ensure text fits
      setContentWidth(spanWidth + 2);
    }
  }, [content]); // Re-measure when content changes

  return {
    contentRef,
    contentWidth,
  };
};

export default useBadgeSize;
