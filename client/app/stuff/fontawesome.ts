'use client';

// app/fontawesome.js
import { useEffect } from 'react';

export function FontAwesome() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = '/fontAwesome-v6.1.2/css/all.min.css';
    link.rel = 'stylesheet';
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  }, []);

  return null;
}
