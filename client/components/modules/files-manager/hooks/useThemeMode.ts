import { useState, useEffect } from 'react';

/**
 * Custom hook to get and track the current theme mode (dark or light)
 *
 * @returns The current theme mode ('dark' or 'light')
 */
export function useThemeMode(): 'dark' | 'light' {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');

    // Check if user has a system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }

    // Listen for changes to color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler function for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no saved preference
      if (!localStorage.getItem('theme')) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    // Use the standard addEventListener API
    // Note: No need for the deprecated methods at all
    try {
      // Modern browsers support addEventListener on MediaQueryList
      mediaQuery.addEventListener('change', handleChange);
    } catch (e) {
      // In the extremely rare case of an error, do nothing
      // This is safer than using deprecated APIs
      console.warn('Could not attach media query listener', e);
    }

    // Cleanup
    return () => {
      try {
        mediaQuery.removeEventListener('change', handleChange);
      } catch (e) {
        // In the extremely rare case of an error, do nothing
        console.warn('Could not remove media query listener', e);
      }
    };
  }, []);

  return themeMode;
}

export default useThemeMode;
