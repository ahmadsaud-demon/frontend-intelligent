import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSchoolByDomain } from '../lib/api';
import type { School } from '../types/auth';

interface SchoolContextType {
  school: School | null;
  loading: boolean;
  error: string | null;
}

const SchoolContext = createContext<SchoolContextType>({
  school: null,
  loading: true,
  error: null
});

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SchoolContextType>({
    school: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function loadSchool() {
      try {
        const domain = window.location.hostname;
        const schoolData = await getSchoolByDomain(domain);
        setState({
          school: schoolData,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          school: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load school data'
        });
      }
    }

    loadSchool();
  }, []);

  return (
    <SchoolContext.Provider value={state}>
      {children}
    </SchoolContext.Provider>
  );
}