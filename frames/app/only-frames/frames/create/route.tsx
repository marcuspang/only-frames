import { NextResponse } from "next/server";
import { encodeFunctionData, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { frames } from "../frames";
import { abi } from "./abi";

const FACTORY_ADDRESS = "0x85e9C8457b01D3Eae92796279044474C4E70416c";

export const POST = frames(async (ctx) => {
  if (!ctx.message) {
    throw new Error("No message");
  }

  const ipfsHash = ctx.searchParams.ipfsHash;
  if (!ipfsHash) {
    throw new Error("No ipfsHash");
  }

  const userAddress = ctx.message.connectedAddress;
  if (!userAddress) {
    throw new Error("No user address");
  }

  console.log({ ipfsHash, userAddress });

  const calldata = encodeFunctionData({
    abi,
    functionName: "uploadContent",
    args: [userAddress! as Address, ipfsHash, 1n, 0n],
  });

  return NextResponse.json({
    chainId: `eip155:${baseSepolia.id}`,
    method: "eth_sendTransaction",
    params: {
      abi: abi,
      to: FACTORY_ADDRESS,
      data: calldata,
      value: 0,
    },
  });
});
