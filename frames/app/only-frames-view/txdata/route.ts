import { TransactionTargetResponse, getAddressForFid } from "frames.js";
import { getFrameMessage } from "frames.js/next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  getContract,
  http,
} from "viem";
import { baseSepolia, optimism } from "viem/chains";
import { storageRegistryABI } from "./contracts/storage-registry";
import { paywallTokenABI } from "./contracts/paywall-token";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);

  if (!frameMessage) {
    throw new Error("No frame message");
  }

  // Get current storage price
  const units = 1n;
  

  const calldata = encodeFunctionData({
    abi: paywallTokenABI,
    functionName: "safeMint",
    args: [frameMessage.requesterVerifiedAddresses[0]],
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  // Need to fetch the erc721 contract address 
  const PAYWALL_REGISTRY_ADDRESS = "0x00000000fcCe7f938e7aE6D3c335bD6a1a7c593D";

  const paywallRegistry = getContract({
    address: PAYWALL_REGISTRY_ADDRESS,
    abi:paywallTokenABI,
    client: publicClient
  });

  const STORAGE_REGISTRY_ADDRESS = "0x00000000fcCe7f938e7aE6D3c335bD6a1a7c593D";

  const storageRegistry = getContract({
    address: STORAGE_REGISTRY_ADDRESS,
    abi: storageRegistryABI,
    client: publicClient,
  });

  // const unitPrice = await storageRegistry.read.price([units]);
  const unitPrice = await paywallRegistry.read._spotPrice
  console.log(unitPrice);

  return NextResponse.json({
    chainId: "eip155:84532", // OP Mainnet 10
    method: "eth_sendTransaction",
    params: {
      abi: paywallTokenABI as Abi,
      to: PAYWALL_REGISTRY_ADDRESS,
      data: calldata,
      value: String(unitPrice) || "0.1",
    },
  });
}
