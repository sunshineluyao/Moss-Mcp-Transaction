import { useState, useEffect, useCallback } from "react";

// EIP-1193 provider type (MetaMask, Rabby, Coinbase Wallet, etc.)
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isAvailable: boolean;
}

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const isAvailable = typeof window !== "undefined" && !!window.ethereum;

  // Restore already-connected account on mount (no new permission prompt)
  useEffect(() => {
    if (!isAvailable) return;

    window.ethereum!.request({ method: "eth_accounts" }).then((accounts) => {
      const list = accounts as string[];
      if (list.length > 0) {
        window.ethereum!.request({ method: "eth_chainId" }).then((chainId) => {
          setState({
            address: list[0],
            chainId: parseInt(chainId as string, 16),
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        });
      }
    }).catch(() => {/* silent */});
  }, [isAvailable]);

  // Listen for account / chain changes
  useEffect(() => {
    if (!isAvailable) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) {
        setState({ address: null, chainId: null, isConnected: false, isConnecting: false, error: null });
      } else {
        setState((s) => ({ ...s, address: list[0], isConnected: true }));
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      setState((s) => ({ ...s, chainId: parseInt(chainId as string, 16) }));
    };

    window.ethereum!.on("accountsChanged", handleAccountsChanged);
    window.ethereum!.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum!.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum!.removeListener("chainChanged", handleChainChanged);
    };
  }, [isAvailable]);

  const connect = useCallback(async () => {
    if (!isAvailable) return;
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" }) as string[];
      const chainIdHex = await window.ethereum!.request({ method: "eth_chainId" }) as string;
      setState({
        address: accounts[0],
        chainId: parseInt(chainIdHex, 16),
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "User rejected connection";
      setState((s) => ({ ...s, isConnecting: false, error: msg }));
    }
  }, [isAvailable]);

  const disconnect = useCallback(() => {
    setState({ address: null, chainId: null, isConnected: false, isConnecting: false, error: null });
  }, []);

  return { ...state, connect, disconnect, isAvailable };
}
