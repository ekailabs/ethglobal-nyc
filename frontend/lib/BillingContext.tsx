'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useBilling, BillingData, Transaction } from './useBilling';

interface BillingContextType {
  billingData: BillingData;
  addTransaction: (amount: number, model: string, txHash?: string) => void;
  refreshData: () => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
  const billing = useBilling();

  return (
    <BillingContext.Provider value={billing}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBillingContext() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBillingContext must be used within BillingProvider');
  }
  return context;
}