import { TransactionTargetResponse, getAddressForFid } from "frames.js";
import { getFrameMessage } from "frames.js/next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  getContract,
  http,
  type Address,
} from "viem";
import { baseSepolia, optimism } from "viem/chains";
import { storageRegistryABI } from "./contracts/storage-registry";
import { paywallTokenABI } from "./contracts/paywall-token";
import { getFactoryEvents } from "../../utils";
import { frames } from "../frames/frames";

export const POST = frames(async (ctx) => {
  if (!ctx.message) {
    throw new Error("No message");
  }
  const userAddress = ctx.message.connectedAddress;

  const ipfsHash = ctx.searchParams.ipfsHash;
  if (!ipfsHash) {
    throw new Error("No ipfsHash");
  }
  const eventLogs = getFactoryEvents();
  const nftAddress = (await eventLogs).find(
    (log) => log.ipfsHash === ipfsHash
  ) as Address;
  if (!nftAddress) {
    throw new Error("No NFT address");
  }

  const calldata = encodeFunctionData({
    abi: paywallTokenABI,
    functionName: "safeMint",
    args: [userAddress],
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const paywallToken = getContract({
    address: nftAddress,
    abi: paywallTokenABI,
    client: publicClient,
  });

  const unitPrice = await paywallToken.read?._spotPrice?.();
  console.log({ unitPrice });

  return NextResponse.json({
    chainId: `eip155:${baseSepolia.id}`, // OP Mainnet 10
    method: "eth_sendTransaction",
    params: {
      abi: paywallTokenABI as Abi,
      to: nftAddress,
      data: calldata,
      value: String(unitPrice) || "0.1",
    },
  });
});
