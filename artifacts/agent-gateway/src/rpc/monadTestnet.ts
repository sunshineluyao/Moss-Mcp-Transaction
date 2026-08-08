import {
  createPublicClient,
  http,
  parseEther,
  formatEther,
  getAddress,
  isAddress,
} from "viem";
import { z } from "zod";
import type { NetworkEvidence } from "../shared/schema.js";

const MONAD_TESTNET_RPC_URL =
  process.env.MONAD_TESTNET_RPC_URL ?? "https://testnet-rpc.monad.xyz";

const MONAD_TESTNET_CHAIN_ID = 10143;
const RPC_TIMEOUT_MS = 10_000;

/** Typed error for RPC-level failures */
export class RpcError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "WRONG_CHAIN"
      | "TIMEOUT"
      | "RPC_FAILURE"
      | "INVALID_ADDRESS"
  ) {
    super(message);
    this.name = "RpcError";
  }
}

function getClient() {
  return createPublicClient({
    transport: http(MONAD_TESTNET_RPC_URL, {
      timeout: RPC_TIMEOUT_MS,
      retryCount: 0,
    }),
  });
}

/**
 * Verify the chain ID matches Monad Testnet (10143).
 * Throws RpcError if it doesn't.
 */
async function verifyChainId(client: ReturnType<typeof getClient>): Promise<number> {
  const chainId = await client.getChainId();
  if (Number(chainId) !== MONAD_TESTNET_CHAIN_ID) {
    throw new RpcError(
      `Wrong chain: expected ${MONAD_TESTNET_CHAIN_ID}, got ${chainId}`,
      "WRONG_CHAIN"
    );
  }
  return Number(chainId);
}

/**
 * Fetch all live Monad Testnet data needed for a transfer preview.
 * Never silently falls back — throws typed RpcError on any failure.
 */
export async function fetchNetworkEvidence(params: {
  sender: string;
  recipient: string;
  amount: string;
}): Promise<NetworkEvidence> {
  const { sender, recipient, amount } = params;

  if (!isAddress(sender)) {
    throw new RpcError(`Invalid sender address: ${sender}`, "INVALID_ADDRESS");
  }
  if (!isAddress(recipient)) {
    throw new RpcError(
      `Invalid recipient address: ${recipient}`,
      "INVALID_ADDRESS"
    );
  }

  const senderChecksummed = getAddress(sender);
  const recipientChecksummed = getAddress(recipient);
  const valueWei = parseEther(amount);

  const client = getClient();
  const queriedAt = new Date().toISOString();

  // Parallel: chainId + latest block number
  const [chainId, blockNumber] = await Promise.all([
    verifyChainId(client),
    client.getBlockNumber(),
  ]);

  // Fetch block for timestamp
  const block = await client.getBlock({ blockNumber });

  // Parallel: balance + gas price + recipient code check
  const [senderBalance, gasPrice, recipientCode] = await Promise.all([
    client.getBalance({ address: senderChecksummed }),
    client.getGasPrice(),
    client.getCode({ address: recipientChecksummed }),
  ]);

  // Gas estimate (may fail if sender has no balance — catch and surface as warning)
  let estimatedGas: bigint;
  try {
    estimatedGas = await client.estimateGas({
      account: senderChecksummed,
      to: recipientChecksummed,
      value: valueWei,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new RpcError(`Gas estimation failed: ${msg}`, "RPC_FAILURE");
  }

  const gasCostWei = estimatedGas * gasPrice;
  const recipientIsContract =
    recipientCode !== undefined && recipientCode !== "0x";

  return {
    chainId: Number(chainId),
    chainIdVerified: true,
    blockNumber: blockNumber.toString(),
    blockTimestamp: Number(block.timestamp),
    senderBalance: senderBalance.toString(),
    senderBalanceEth: formatEther(senderBalance),
    estimatedGas: estimatedGas.toString(),
    gasPrice: gasPrice.toString(),
    gasCostEth: formatEther(gasCostWei),
    recipientIsContract,
    rpcUrl: MONAD_TESTNET_RPC_URL,
    queriedAt,
  };
}

/**
 * Lightweight network check: chain ID + latest block number.
 * Used for /api/network endpoint.
 */
export async function fetchNetworkStatus(): Promise<{
  chainId: number;
  blockNumber: string;
  rpcUrl: string;
}> {
  const client = getClient();
  const [chainId, blockNumber] = await Promise.all([
    verifyChainId(client),
    client.getBlockNumber(),
  ]);
  return {
    chainId,
    blockNumber: blockNumber.toString(),
    rpcUrl: MONAD_TESTNET_RPC_URL,
  };
}
