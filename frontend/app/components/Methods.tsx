'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets, useSendBalance } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { parseEther, parseUnits } from 'viem'

import './Methods.css';

interface DynamicMethodsProps {
	isDarkMode: boolean;
}

export default function DynamicMethods({ isDarkMode }: DynamicMethodsProps) {
	const isLoggedIn = useIsLoggedIn();
	const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
	const userWallets = useUserWallets();
	const { open: openSendBalance } = useSendBalance();
	const [isLoading, setIsLoading] = useState(true);
	const [result, setResult] = useState('');
	const [error, setError] = useState<string | null>(null);

	
  const safeStringify = (obj: unknown): string => {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      },
      2
    );
  };
  

	useEffect(() => {
		if (sdkHasLoaded && isLoggedIn && primaryWallet) {
			setIsLoading(false);
		} else {
			setIsLoading(true);
		}
	}, [sdkHasLoaded, isLoggedIn, primaryWallet]);

	function clearResult() {
		setResult('');
		setError(null);
	}

	function showUser() {
		try {
			setResult(safeStringify(user));
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to stringify user data');
		}
	}

	function showUserWallets() {
		try {
			setResult(safeStringify(userWallets));
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to stringify wallet data');
		}
	}


  async function fetchFernCustomers() {
    console.log('🌐 Fetching customers from Fern API...');
    const response = await fetch('https://api.fernhq.com/customers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FERN_BEARER_TOKEN}`
      }
    });

    console.log('📡 Fetch customers response status:', response.status);
    if (!response.ok) {
      console.error('❌ Failed to fetch customers:', response.status, response.statusText);
      throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched customers');
    return data;
  }

  interface FernCustomer {
    customerId: string;
    customerStatus: string;
    email: string;
    customerType: string;
    name: string;
    updatedAt: string;
    organizationId: string;
    kycLink: string;
  }

  function findExistingCustomer(customers: FernCustomer[], email: string) {
    return customers.find(customer => customer.email.toLowerCase() === email.toLowerCase());
  }

  async function fetchPaymentAccounts(customerId: string) {
    console.log('💳 Fetching payment accounts for customer:', customerId);
    const response = await fetch(`https://api.fernhq.com/payment-accounts?customerId=${customerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FERN_BEARER_TOKEN}`
      }
    });

    console.log('📡 Fetch payment accounts response status:', response.status);
    if (!response.ok) {
      console.error('❌ Failed to fetch payment accounts:', response.status, response.statusText);
      throw new Error(`Failed to fetch payment accounts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched payment accounts');
    return data;
  }

  async function createFernCustomer(email: string, firstName: string, lastName: string) {
    console.log('🔨 Creating new customer in Fern API...');
    const response = await fetch('https://api.fernhq.com/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FERN_BEARER_TOKEN}`
      },
      body: JSON.stringify({
        customerType: 'INDIVIDUAL',
        email,
        firstName,
        lastName
      })
    });

    console.log('📡 Create customer response status:', response.status);
    if (!response.ok) {
      console.error('❌ Failed to create customer:', response.status, response.statusText);
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully created customer');
    return data;
  }

  async function sendPYUSD() {
    try {
      console.log('💰 Opening basic send balance modal');
      
      // Use the basic version - just open the modal
      const tx = await openSendBalance({recipientAddress: '0x0000000000000000000000000000000000000000', value: parseEther('1')});
      
      console.log('✅ Send balance modal opened:', tx);
      
    } catch (err) {
      console.error('💥 Error opening send balance modal:', err);
      setError(err instanceof Error ? err.message : 'Failed to open send balance modal');
    }
  }

  async function addFiatToWallet() {
    try {
      setIsLoading(true);
      const userEmail = user?.email || 'user@example.com';
      const walletAddress = primaryWallet?.address || 'No wallet address available';
      
      console.log('🔍 Starting fiat wallet process for email:', userEmail);
      
      // First, fetch existing customers to check if user already exists
      const customersResponse = await fetchFernCustomers();
      console.log('📋 Fetched customers response:', customersResponse);
      
      const existingCustomer = findExistingCustomer(customersResponse.customers, userEmail);
      
      if (existingCustomer) {
        console.log('👤 Found existing customer:', existingCustomer);
        console.log('📊 Customer status:', existingCustomer.customerStatus);
        // User already exists, check customer status
        if (existingCustomer.customerStatus === 'ACTIVE') {
          console.log('✅ Customer status is ACTIVE - fetching payment accounts');
          // Customer KYC is complete, fetch payment accounts
          const paymentAccounts = await fetchPaymentAccounts(existingCustomer.customerId);
          console.log('💳 Payment accounts response:', paymentAccounts);
          
          // Check if customer has any payment accounts
          if (!paymentAccounts || !paymentAccounts.paymentAccounts || paymentAccounts.paymentAccounts.length === 0) {
            console.log('❌ No payment accounts found for customer - response is empty');
            const onRampData = {
              userEmail,
              walletAddress,
              existingCustomer: {
                customerId: existingCustomer.customerId,
                customerStatus: existingCustomer.customerStatus,
                name: existingCustomer.name
              },
              action: 'Add Fiat to Wallet - No Payment Account',
              timestamp: new Date().toISOString(),
              message: 'Customer needs to add a payment account to proceed'
            };
            
            setResult(safeStringify(onRampData));
            setError(null);
          } else {
            console.log('✅ Payment accounts found:', paymentAccounts.paymentAccounts.length, 'accounts');
            const onRampData = {
              userEmail,
              walletAddress,
              existingCustomer: {
                customerId: existingCustomer.customerId,
                customerStatus: existingCustomer.customerStatus,
                name: existingCustomer.name
              },
              paymentAccounts,
              action: 'Add Fiat to Wallet - Customer Ready',
              timestamp: new Date().toISOString()
            };
            
            setResult(safeStringify(onRampData));
            setError(null);
          }
        } else if (existingCustomer.customerStatus === 'CREATED') {
          console.log('⚠️  Customer status is CREATED - KYC verification required');
          // Customer needs to complete KYC
          const shouldOpenKyc = window.confirm(
            `Your account requires KYC verification. Current status: ${existingCustomer.customerStatus}\n\nWould you like to open the KYC verification link?`
          );
          
          if (shouldOpenKyc && existingCustomer.kycLink) {
            console.log('🔗 Opening KYC link:', existingCustomer.kycLink);
            window.open(existingCustomer.kycLink, '_blank');
          } else {
            console.log('❌ User declined to open KYC link or no link available');
          }
          
          const onRampData = {
            userEmail,
            walletAddress,
            existingCustomer: {
              customerId: existingCustomer.customerId,
              kycLink: existingCustomer.kycLink,
              customerStatus: existingCustomer.customerStatus,
              name: existingCustomer.name
            },
            action: 'Add Fiat to Wallet - KYC Required',
            timestamp: new Date().toISOString(),
            message: 'Please complete KYC verification to proceed'
          };
          
          setResult(safeStringify(onRampData));
          setError(null);
        } else {
          console.log('❓ Unknown customer status:', existingCustomer.customerStatus);
          // Handle other statuses
          const onRampData = {
            userEmail,
            walletAddress,
            existingCustomer: {
              customerId: existingCustomer.customerId,
              kycLink: existingCustomer.kycLink,
              customerStatus: existingCustomer.customerStatus,
              name: existingCustomer.name
            },
            action: 'Add Fiat to Wallet - Unknown Status',
            timestamp: new Date().toISOString(),
            message: `Customer status: ${existingCustomer.customerStatus}. Please contact support.`
          };
          
          setResult(safeStringify(onRampData));
          setError(null);
        }
      } else {
        console.log('🆕 No existing customer found - creating new customer');
        // User doesn't exist, need to collect first and last name
        const firstName = prompt('Please enter your first name:') || user?.firstName;
        const lastName = prompt('Please enter your last name:') || user?.lastName;
        
        console.log('📝 Creating customer with:', { firstName, lastName, email: userEmail });
        
        if (!firstName || !lastName) {
          throw new Error('First name and last name are required to create a new customer');
        }
        
        // Create new customer
        const fernResponse = await createFernCustomer(userEmail, firstName, lastName);
        console.log('✨ New customer created:', fernResponse);
        console.log('📊 New customer status:', fernResponse.customerStatus || 'Status not provided');
        
        // Check if new customer has KYC link and prompt for verification
        if (fernResponse.kycLink) {
          console.log('🔗 New customer has KYC link:', fernResponse.kycLink);
          const shouldOpenKyc = window.confirm(
            'Your account has been created successfully! You need to complete KYC verification to proceed.\n\nWould you like to open the KYC verification link now?'
          );
          
          if (shouldOpenKyc) {
            console.log('🔗 Opening KYC link for new customer');
            window.open(fernResponse.kycLink, '_blank');
          } else {
            console.log('❌ User declined to open KYC link for new customer');
          }
        } else {
          console.log('❌ No KYC link provided for new customer');
        }
        
        const onRampData = {
          userEmail,
          walletAddress,
          firstName,
          lastName,
          newCustomer: fernResponse,
          action: 'Add Fiat to Wallet - New Customer Created',
          timestamp: new Date().toISOString(),
          message: fernResponse.kycLink ? 'Please complete KYC verification to proceed' : 'Customer created successfully'
        };
        
        setResult(safeStringify(onRampData));
        setError(null);
      }
    } catch (err) {
      console.error('💥 Error in addFiatToWallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to process customer or fetch on-ramp data');
    } finally {
      setIsLoading(false);
      console.log('🏁 Finished fiat wallet process');
    }
  }

	return (
		<>
			{!isLoading && (
				<div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
					<div className="methods-container">
						<div className="wallet-info">
							<div className="network-info">
								<span className="network-badge">
									<span className="network-icon">S</span>
									Sepolia
								</span>
								<span className="wallet-address">
									<span className="wallet-icon">👛</span>
									{primaryWallet?.address ? `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}` : 'No wallet'}
								</span>
							</div>
						</div>
						
						<div className="action-buttons">
							<button className="btn btn-primary btn-large" onClick={addFiatToWallet}>
								Add Fiat to Wallet
							</button>
							<button className="btn btn-primary btn-large" onClick={sendPYUSD}>
								Send PYUSD
							</button>
						</div>

						{primaryWallet && isEthereumWallet(primaryWallet) && (
		<>
		</>
	)}
					</div>
					{(result || error) && (
						<div className="results-container">
							{error ? (
								<pre className="results-text error">{error}</pre>
							) : (
								<pre className="results-text">{result}</pre>
							)}
						</div>
					)}
					{(result || error) && (
						<div className="clear-container">
							<button className="btn btn-primary" onClick={clearResult}>Clear</button>
						</div>
					)}
				</div>
			)}
		</>
	);
}