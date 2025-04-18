import React from 'react';
import { createRoot, Root } from 'react-dom/client';

/**
 * Utility to render React components in SweetAlert2 modals
 * using React 18+ createRoot API
 */
export const ComponentRenderer = {
  /**
   * Render a React component to a container element
   * @param component React component to render
   * @param targetElement Container element
   * @returns Cleanup function to unmount component
   */
  render(component: React.ReactNode, targetElement: HTMLElement): () => void {
    // Create a wrapper div to render the component
    const wrapper = document.createElement('div');
    targetElement.appendChild(wrapper);

    // Create a root using the new React 18 API
    const root: Root = createRoot(wrapper);

    // Render the component to the root
    root.render(<>{component}</>);

    // Return cleanup function to unmount component
    return () => {
      // Unmount using the root's unmount method
      root.unmount();
      wrapper.remove();
    };
  },
};

export default ComponentRenderer;
