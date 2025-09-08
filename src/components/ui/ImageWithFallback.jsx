import React, { useState } from 'react';

const ImageWithFallback = ({
  src,
  alt,
  fallback,
  className,
  
  // All other props passed to img element
  ...imgProps
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Show image if src exists and no error occurred
  const shouldShowImage = src && !imageError;

  if (shouldShowImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleImageError}
        {...imgProps}
      />
    );
  }

  // Show fallback content
  return fallback;
};

export default ImageWithFallback;