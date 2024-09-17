'use client';

import { useEffect } from 'react';

export function TWEInitializer() {
  useEffect(() => {
    const initTWE = async () => {
      const { Input, Ripple, initTWE } = await import('tw-elements');
      initTWE({ Input, Ripple });
    };
    initTWE();
  }, []);

  return null;
}
