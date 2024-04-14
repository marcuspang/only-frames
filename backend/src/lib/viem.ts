import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { abi } from "../abi/PaywallTokenFactoryABI";

export const publicClient = createPublicClient({
  transport: http(),
  chain: baseSepolia,
});

const FACTORY_ADDRESS = "0x85e9C8457b01D3Eae92796279044474C4E70416c";

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
