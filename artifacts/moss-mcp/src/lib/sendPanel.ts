/**
 * sendPanel.ts
 *
 * Pure utility for the SendPanel component's network-switching safety logic.
 * Extracted into its own module so it can be unit-tested without a DOM or
 * React rendering environment.
 */

export const MONAD_TESTNET_CHAIN_PARAMS = {
  chainId: "0x279f", // 10143 decimal: 0x279f
  chainName: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
} as const;

export const MONAD_CHAIN_HEX = "0x279f"; // parseInt("0x279f", 16) === 10143
export const MONAD_CHAIN_ID = 10143;

/** Minimal EIP-1193 provider interface (request method only). */
export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export type EnsureNetworkResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Ensures the given EIP-1193 provider is on Monad Testnet (chain 10143).
 *
 * Safety rules:
 * - 4902 (EIP-1193 "unknown chain"): attempt `wallet_addEthereumChain`; abort if add fails.
 * - 4001 (user rejected switch): abort immediately — never fall through.
 * - -32603 (generic internal RPC error): treated as a switch failure — abort immediately.
 * - Any other error: abort immediately.
 * - After any successful switch or add: re-query `eth_chainId` and verify it equals
 *   0x278f before returning `{ ok: true }`.
 *
 * `eth_sendTransaction` must NEVER be called by the caller if this returns `{ ok: false }`.
 */
export async function ensureMonadTestnet(
  provider: Eip1193Provider,
): Promise<EnsureNetworkResult> {
  // ── Step 1: switch to Monad Testnet ────────────────────────────────────────
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET_CHAIN_PARAMS.chainId }],
    });
  } catch (switchErr: unknown) {
    const code = (switchErr as { code?: number }).code;

    if (code === 4902) {
      // Chain not in wallet (standard unknown-chain signal) — try adding it.
      // -32603 is intentionally excluded: it is a generic internal error,
      // not a signal that the chain is missing, so it must abort here.
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [MONAD_TESTNET_CHAIN_PARAMS],
        });
      } catch {
        return {
          ok: false,
          error:
            "Could not add Monad Testnet. Add it manually (chain 10143, RPC https://testnet-rpc.monad.xyz) then try again.",
        };
      }
    } else {
      // 4001 (user rejected), -32603 (internal RPC error), or any other error —
      // always abort; never proceed to eth_sendTransaction.
      return {
        ok: false,
        error:
          code === 4001
            ? "Network switch rejected. Switch to Monad Testnet (chain 10143) in your wallet, then try again."
            : "Network switch failed. Ensure your wallet supports Monad Testnet.",
      };
    }
  }

  // ── Step 2: verify chain ID after switch or add ────────────────────────────
  // Do not trust the switch/add call alone — re-query eth_chainId.
  let activeChainId: string;
  try {
    activeChainId = (await provider.request({ method: "eth_chainId" })) as string;
  } catch {
    return { ok: false, error: "Could not read the current chain ID from your wallet." };
  }

  if (activeChainId.toLowerCase() !== MONAD_CHAIN_HEX) {
    return {
      ok: false,
      error: `Wallet is still on chain ${parseInt(activeChainId, 16)}, not Monad Testnet (10143). Switch networks manually and try again.`,
    };
  }

  return { ok: true };
}
