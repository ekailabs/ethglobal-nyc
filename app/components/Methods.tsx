'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'


import './Methods.css';

interface DynamicMethodsProps {
	isDarkMode: boolean;
}

export default function DynamicMethods({ isDarkMode }: DynamicMethodsProps) {
	const isLoggedIn = useIsLoggedIn();
	const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
	const userWallets = useUserWallets();
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

	
  async function fetchEthereumPublicClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      const result = await primaryWallet.getPublicClient();
      setResult(safeStringify(result));
    } catch (error) {
      setResult(safeStringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }));
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumWalletClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      const result = await primaryWallet.getWalletClient();
      setResult(safeStringify(result));
    } catch (error) {
      setResult(safeStringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }));
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumMessage() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(safeStringify(result));
    } catch (error) {
      setResult(safeStringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }));
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFernCustomers() {
    const response = await fetch('https://api.fernhq.com/customers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.FERN_BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
    }

    return await response.json();
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

  async function createFernCustomer(email: string, firstName: string, lastName: string) {
    const response = await fetch('https://api.fernhq.com/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FERN_BEARER_TOKEN}`
      },
      body: JSON.stringify({
        customerType: 'INDIVIDUAL',
        email,
        firstName,
        lastName
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async function addFiatToWallet() {
    try {
      setIsLoading(true);
      const userEmail = user?.email || 'user@example.com';
      const walletAddress = primaryWallet?.address || 'No wallet address available';
      
      // First, fetch existing customers to check if user already exists
      const customersResponse = await fetchFernCustomers();
      const existingCustomer = findExistingCustomer(customersResponse.customers, userEmail);
      
      if (existingCustomer) {
        // User already exists, return customer ID and KYC link
        const onRampData = {
          userEmail,
          walletAddress,
          existingCustomer: {
            customerId: existingCustomer.customerId,
            kycLink: existingCustomer.kycLink,
            customerStatus: existingCustomer.customerStatus,
            name: existingCustomer.name
          },
          action: 'Add Fiat to Wallet - Existing Customer',
          timestamp: new Date().toISOString()
        };
        
        setResult(safeStringify(onRampData));
        setError(null);
      } else {
        // User doesn't exist, need to collect first and last name
        const firstName = prompt('Please enter your first name:') || user?.firstName;
        const lastName = prompt('Please enter your last name:') || user?.lastName;
        
        if (!firstName || !lastName) {
          throw new Error('First name and last name are required to create a new customer');
        }
        
        // Create new customer
        const fernResponse = await createFernCustomer(userEmail, firstName, lastName);
        
        const onRampData = {
          userEmail,
          walletAddress,
          firstName,
          lastName,
          newCustomer: fernResponse,
          action: 'Add Fiat to Wallet - New Customer Created',
          timestamp: new Date().toISOString()
        };
        
        setResult(safeStringify(onRampData));
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process customer or fetch on-ramp data');
    } finally {
      setIsLoading(false);
    }
  }

	return (
		<>
			{!isLoading && (
				<div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
					<div className="methods-container">
						<button className="btn btn-primary" onClick={showUser}>Fetch User</button>
						<button className="btn btn-primary" onClick={showUserWallets}>Fetch User Wallets</button>
						<button className="btn btn-primary" onClick={addFiatToWallet}>Add Fiat to Wallet</button>

						{primaryWallet && isEthereumWallet(primaryWallet) && (
		<>
			
      <button type="button" className="btn btn-primary" onClick={fetchEthereumPublicClient}>
        Fetch PublicClient
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchEthereumWalletClient}>
        Fetch WalletClient
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchEthereumMessage}>
        Fetch Message
      </button>
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