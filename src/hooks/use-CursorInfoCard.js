import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for cursor-following info card
 * Provides smooth mouse tracking and content management for floating tooltips
 *
 * @param {object} options - Configuration options
 * @param {number} [options.showDelay=300] - Delay in ms before showing the card
 * @param {number} [options.hideDelay=100] - Delay in ms before hiding the card
 *
 * @example
 * const cursorCard = useCursorInfoCard({ showDelay: 400, hideDelay: 150 });
 *
 * <div
 *   onMouseEnter={() => cursorCard.show('Full content here')}
 *   onMouseMove={cursorCard.updatePosition}
 *   onMouseLeave={cursorCard.hide}
 * >
 *   Truncated...
 * </div>
 *
 * <CursorInfoCard {...cursorCard.state}>
 *   {cursorCard.state.content}
 * </CursorInfoCard>
 */
export function useCursorInfoCard({ showDelay = 300, hideDelay = 100 } = {}) {
  const [state, setState] = useState({
    visible: false,
    content: null,
    x: 0,
    y: 0,
  });

  const rafRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const pendingContentRef = useRef(null);

  const show = useCallback((content) => {
    // Clear any pending hide
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Store pending content
    pendingContentRef.current = content;

    // If already visible, update content immediately (no delay for switching between items)
    if (state.visible) {
      setState(prev => ({ ...prev, content }));
      return;
    }

    // Clear any existing show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    // Delay showing the card
    showTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, visible: true, content: pendingContentRef.current }));
      showTimeoutRef.current = null;
    }, showDelay);
  }, [showDelay, state.visible]);

  const hide = useCallback(() => {
    // Clear any pending show
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Delay hiding the card
    hideTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, visible: false, content: null }));
      hideTimeoutRef.current = null;
      pendingContentRef.current = null;
    }, hideDelay);
  }, [hideDelay]);

  const updatePosition = useCallback((e) => {
    // Use RAF for smooth 60fps updates without causing re-renders on every mousemove
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setState(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    });
  }, []);

  const updateContent = useCallback((content) => {
    setState(prev => ({ ...prev, content }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return {
    state,
    show,
    hide,
    updatePosition,
    updateContent,
  };
}

export default useCursorInfoCard;
