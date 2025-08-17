'use client';

import { useEffect } from 'react';
import { useBillingContext } from '../../lib/BillingContext';

interface BillingDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BillingDashboard({ isOpen, onClose }: BillingDashboardProps) {
  const { billingData, refreshData } = useBillingContext();

  useEffect(() => {
    if (isOpen) {
      refreshData();
      console.log('📊 Dashboard opened, billing data:', billingData);
    }
  }, [isOpen, refreshData]);

  useEffect(() => {
    console.log('📈 Billing data updated:', billingData);
  }, [billingData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#004f4f] to-[#006666] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#004f4f]">Billing Dashboard</h2>
              <p className="text-sm text-[#004f4f]/60">Usage analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-gradient-to-br from-[#004f4f] to-[#006666] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Total Spent</h3>
                <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-3xl font-bold">${billingData.totalSpent24h.toFixed(2)} PYUSD</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Transactions</h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-[#004f4f]">{billingData.transactionCount}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Avg per Request</h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-[#004f4f]">
                ${(billingData.totalSpent24h / billingData.transactionCount).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost per Model Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#004f4f] mb-4">Cost per Model</h3>
              <div className="flex items-center justify-center h-40">
                {Object.keys(billingData.modelCosts).length > 0 ? (
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                      {(() => {
                        const totalCost = Object.values(billingData.modelCosts).reduce((sum, cost) => sum + cost, 0);
                        let currentAngle = 0;
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                        
                        return Object.entries(billingData.modelCosts).map(([model, cost], index) => {
                          const percentage = cost / totalCost;
                          const circumference = 2 * Math.PI * 50;
                          const strokeDasharray = `${percentage * circumference} ${circumference}`;
                          const strokeDashoffset = -currentAngle * circumference / 360;
                          
                          const segment = (
                            <circle
                              key={model}
                              cx="64"
                              cy="64"
                              r="50"
                              fill="none"
                              stroke={colors[index % colors.length]}
                              strokeWidth="20"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-300"
                            />
                          );
                          
                          currentAngle += percentage * 360;
                          return segment;
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-[#004f4f]">${billingData.totalSpent24h.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-sm">No data available</div>
                  </div>
                )}
              </div>
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {Object.entries(billingData.modelCosts).map(([model, cost], index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  return (
                    <div key={model} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-sm text-gray-700">{model.split('/').pop()}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#004f4f]">${cost.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Model Usage */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#004f4f] mb-4">Model Usage</h3>
              <div className="space-y-3">
                {Object.entries(billingData.modelUsage).map(([model, count]) => (
                  <div key={model} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#004f4f] rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">{model.split('/').pop()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#004f4f] to-[#006666] transition-all duration-300"
                          style={{ width: `${(count / Math.max(...Object.values(billingData.modelUsage))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-[#004f4f] w-6">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#004f4f] mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Time</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Model</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {billingData.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-700">
                        {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 text-sm text-gray-700">{tx.model.split('/').pop()}</td>
                      <td className="py-3 text-sm font-semibold text-[#004f4f]">${tx.amount.toFixed(2)} PYUSD</td>
                      <td className="py-3 text-sm">
                        {tx.txHash ? (
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-mono text-xs hover:underline"
                          >
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}