import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  model: string;
  timestamp: Date;
  txHash?: string;
}

export interface BillingData {
  totalSpent24h: number;
  transactionCount: number;
  modelUsage: { [key: string]: number };
  hourlySpending: number[];
  recentTransactions: Transaction[];
}

const BILLING_STORAGE_KEY = 'vistai_billing_data';

export function useBilling() {
  const [billingData, setBillingData] = useState<BillingData>({
    totalSpent24h: 0,
    transactionCount: 0,
    modelUsage: {},
    hourlySpending: new Array(24).fill(0),
    recentTransactions: []
  });

  // Load billing data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(BILLING_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const transactions = parsed.recentTransactions?.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        })) || [];
        
        setBillingData({
          ...parsed,
          recentTransactions: transactions
        });
      } catch (error) {
        console.warn('Failed to load billing data:', error);
      }
    }
  }, []);

  // Save billing data to localStorage whenever it changes
  const saveBillingData = useCallback((data: BillingData) => {
    try {
      localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save billing data:', error);
    }
  }, []);

  // Add a new transaction
  const addTransaction = useCallback((amount: number, model: string, txHash?: string) => {
    console.log('💰 Adding transaction to billing:', { amount, model, txHash });
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      amount,
      model,
      timestamp: new Date(),
      txHash
    };

    console.log('📝 Created transaction object:', transaction);

    setBillingData(prev => {
      console.log('📊 Previous billing data:', prev);
      // Filter transactions from last 24 hours
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const allTransactions = [transaction, ...prev.recentTransactions];
      const recent24h = allTransactions.filter(tx => tx.timestamp > twentyFourHoursAgo);
      
      // Calculate totals
      const totalSpent24h = recent24h.reduce((sum, tx) => sum + tx.amount, 0);
      const transactionCount = recent24h.length;
      
      // Calculate model usage
      const modelUsage: { [key: string]: number } = {};
      recent24h.forEach(tx => {
        modelUsage[tx.model] = (modelUsage[tx.model] || 0) + 1;
      });
      
      // Calculate hourly spending
      const hourlySpending = new Array(24).fill(0);
      recent24h.forEach(tx => {
        const hoursDiff = Math.floor((now.getTime() - tx.timestamp.getTime()) / (1000 * 60 * 60));
        if (hoursDiff < 24) {
          hourlySpending[23 - hoursDiff] += tx.amount;
        }
      });

      const newData: BillingData = {
        totalSpent24h,
        transactionCount,
        modelUsage,
        hourlySpending,
        recentTransactions: recent24h.slice(0, 50) // Keep last 50 transactions
      };
      
      console.log('💾 New billing data calculated:', newData);
      saveBillingData(newData);
      return newData;
    });
  }, [saveBillingData]);

  // Refresh data (filter old transactions)
  const refreshData = useCallback(() => {
    setBillingData(prev => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recent24h = prev.recentTransactions.filter(tx => tx.timestamp > twentyFourHoursAgo);
      
      const totalSpent24h = recent24h.reduce((sum, tx) => sum + tx.amount, 0);
      const transactionCount = recent24h.length;
      
      const modelUsage: { [key: string]: number } = {};
      recent24h.forEach(tx => {
        modelUsage[tx.model] = (modelUsage[tx.model] || 0) + 1;
      });
      
      const hourlySpending = new Array(24).fill(0);
      recent24h.forEach(tx => {
        const hoursDiff = Math.floor((now.getTime() - tx.timestamp.getTime()) / (1000 * 60 * 60));
        if (hoursDiff < 24) {
          hourlySpending[23 - hoursDiff] += tx.amount;
        }
      });

      const newData: BillingData = {
        totalSpent24h,
        transactionCount,
        modelUsage,
        hourlySpending,
        recentTransactions: recent24h
      };
      
      saveBillingData(newData);
      return newData;
    });
  }, [saveBillingData]);

  return {
    billingData,
    addTransaction,
    refreshData
  };
}