import { createContext, useContext, useState } from 'react';

const BookingExpandContext = createContext();

export function BookingExpandProvider({ children }) {
  const [expandedAgencies, setExpandedAgencies] = useState(new Set());
  const [loadingAgencies, setLoadingAgencies] = useState(new Set());

  const toggleAgency = (agencyId) => {
    setExpandedAgencies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agencyId)) {
        newSet.delete(agencyId);
      } else {
        newSet.add(agencyId);
      }
      return newSet;
    });
  };

  const isAgencyExpanded = (agencyId) => {
    return expandedAgencies.has(agencyId);
  };

  const setAgencyLoading = (agencyId, isLoading) => {
    setLoadingAgencies((prev) => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(agencyId);
      } else {
        newSet.delete(agencyId);
      }
      return newSet;
    });
  };

  const isAgencyLoading = (agencyId) => {
    return loadingAgencies.has(agencyId);
  };

  return (
    <BookingExpandContext.Provider
      value={{
        expandedAgencies,
        toggleAgency,
        isAgencyExpanded,
        setAgencyLoading,
        isAgencyLoading,
      }}
    >
      {children}
    </BookingExpandContext.Provider>
  );
}

export function useBookingExpand() {
  const context = useContext(BookingExpandContext);
  if (!context) {
    throw new Error('useBookingExpand must be used within BookingExpandProvider');
  }
  return context;
}
