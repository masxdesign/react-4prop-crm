import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CSSCarousel.module.css';

const CSSCarousel = ({ 
  children, 
  showNavigation = true,
  className = '',
  slideClassName = ''
}) => {
  const viewportRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (!viewportRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = viewportRef.current;
    setCanScrollPrev(scrollLeft > 0);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scrollPrev = useCallback(() => {
    if (!viewportRef.current) return;
    
    const slideWidth = viewportRef.current.clientWidth / 3; // Show 3 items
    viewportRef.current.scrollBy({
      left: -slideWidth,
      behavior: 'smooth'
    });
  }, []);

  const scrollNext = useCallback(() => {
    if (!viewportRef.current) return;
    
    const slideWidth = viewportRef.current.clientWidth / 3; // Show 3 items
    viewportRef.current.scrollBy({
      left: slideWidth,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Initial update
    updateScrollButtons();

    // Add scroll listener
    viewport.addEventListener('scroll', updateScrollButtons, { passive: true });
    
    // Add resize listener for responsive behavior
    const handleResize = () => {
      updateScrollButtons();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      viewport.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScrollButtons]);

  return (
    <div className={`${styles.carousel} ${className}`}>
      <div 
        ref={viewportRef}
        className={styles.viewport}
      >
        <div className={styles.container}>
          {React.Children.map(children, (child, index) => (
            <div 
              key={index} 
              className={`${styles.slide} ${slideClassName}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      
      {showNavigation && (
        <>
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className={styles.navIcon} />
          </button>
          
          <button
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className={styles.navIcon} />
          </button>
        </>
      )}
    </div>
  );
};

export default CSSCarousel;