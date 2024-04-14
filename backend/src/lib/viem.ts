import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { abi } from "../abi/PaywallTokenFactoryABI";

export const publicClient = createPublicClient({
  transport: http(),
  chain: baseSepolia,
});

// sepolia
const FACTORY_ADDRESS = "0xeD979fC9548dee08cE4a0A1FA8910846CCAAB416";

export async function getLastThousandEvents() {
  const currentBlock = await publicClient.getBlockNumber();
  const logs = await publicClient.getContractEvents({
    address: FACTORY_ADDRESS,
    eventName: "ContentUploaded",
    fromBlock: currentBlock - BigInt(1000),
    toBlock: currentBlock,
    abi,
  });
  return logs;
}

export async function findNftAddressInLastThousandEvents(
  ipfsHash: string,
  transactionHash: string,
) {
  const logs = await getLastThousandEvents();
  const nftAddress = logs.find(
    (log) =>
      log.args.ipfsHash === ipfsHash ||
      log.transactionHash.toLowerCase() === transactionHash.toLowerCase(),
  )?.args.nftAddress;
  return nftAddress;
}
