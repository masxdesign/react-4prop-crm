import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EmblaCarousel = ({ 
  children, 
  options = {}, 
  showNavigation = true,
  className = '',
  slideClassName = ''
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    ...options
  });
  
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
    
    return () => {
      emblaApi?.off('reInit', onSelect);
      emblaApi?.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {React.Children.map(children, (child, index) => (
            <div 
              key={index} 
              className={`flex-[0_0_33.333%] min-w-0 px-2 ${slideClassName}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      
      {showNavigation && (
        <>
          <button
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 
              flex items-center justify-center w-8 h-8 rounded-full 
              bg-white shadow-md border border-gray-200 hover:bg-gray-50 
              transition-all duration-200 ${
                prevBtnDisabled 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:shadow-lg'
              }`}
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 
              flex items-center justify-center w-8 h-8 rounded-full 
              bg-white shadow-md border border-gray-200 hover:bg-gray-50 
              transition-all duration-200 ${
                nextBtnDisabled 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:shadow-lg'
              }`}
            onClick={scrollNext}
            disabled={nextBtnDisabled}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default EmblaCarousel;