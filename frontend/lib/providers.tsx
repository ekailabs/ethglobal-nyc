'use client';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";


export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  

  return (
   <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID!,
        walletConnectors: [EthereumWalletConnectors,ZeroDevSmartWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}