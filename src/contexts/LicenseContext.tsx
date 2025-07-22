import React, { createContext, useContext, ReactNode } from 'react';
import { useLicense, LicenseInfo, LicensePlan } from '@/hooks/useLicense';

interface LicenseContextType {
  license: LicenseInfo | null;
  plans: LicensePlan[];
  loading: boolean;
  error: string | null;
  fetchLicenseStatus: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  activateLicense: (planId: string, licenseKey?: string) => Promise<boolean>;
  hasFeature: (feature: string) => boolean;
  isWithinLimit: (type: 'usuarios' | 'lancamentos' | 'produtos', current: number) => boolean;
  isExpiringSoon: () => boolean;
  isExpired: () => boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const licenseData = useLicense();

  return (
    <LicenseContext.Provider value={licenseData}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicenseContext() {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicenseContext must be used within a LicenseProvider');
  }
  return context;
}