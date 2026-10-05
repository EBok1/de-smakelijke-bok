'use client';

import { useEffect } from 'react';

/**
 * Sets data-vt-direction="back" on <html> when the user navigates back,
 * so CSS can run the reversed border-radius animation on the view transition.
 * The attribute is cleaned up after the animation has had time to finish.
 */
export default function ViewTransitionDirection() {
  useEffect(() => {
    const handlePopState = () => {
      document.documentElement.dataset.vtDirection = 'back';
      // Clean up after the animation is done (600ms animation + buffer)
      setTimeout(() => {
        delete document.documentElement.dataset.vtDirection;
      }, 800);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return null;
}
