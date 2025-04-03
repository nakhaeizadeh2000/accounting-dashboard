import { useEffect, RefObject, useState, useCallback } from 'react';

export function useIntersectionObserver<T extends HTMLElement>(
  ref: RefObject<T>,
  options: IntersectionObserverInit = {},
  isEnabled: boolean = true,
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
  }, []);

  useEffect(() => {
    if (!isEnabled || !ref.current) return;

    const observer = new IntersectionObserver(callback, options);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options, callback, isEnabled]);

  return isIntersecting;
}
