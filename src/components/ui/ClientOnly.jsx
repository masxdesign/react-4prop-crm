import { useState, useEffect } from 'react';

/**
 * ClientOnly Component - Temporary patch for React state update warnings
 * 
 * This component prevents hydration issues and state update warnings by ensuring
 * children only render after the client has mounted. This is specifically needed
 * to work around TanStack Table React Strict Mode issues.
 * 
 * @see https://github.com/TanStack/table/issues/5026
 * 
 * TODO: Remove this patch when TanStack Table fixes the underlying issue
 * or when we upgrade to a version that resolves the React state update warnings
 */
const ClientOnly = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
};

export default ClientOnly;