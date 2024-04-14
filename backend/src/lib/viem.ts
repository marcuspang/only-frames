import { createPublicClient, getContract, http, type Hex } from "viem";
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
  transactionHash: string
) {
  const logs = await getLastThousandEvents();
  const log = logs.find(
    (log) =>
      log.args.ipfsHash === ipfsHash ||
      log.transactionHash.toLowerCase() === transactionHash.toLowerCase()
  );
  console.log({ log });
  return log?.args.nftAddress;
}

export async function getCreatedNftAddress(
  ipfsHash: string,
  transactionHash: Hex
) {
  const data = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
  });
  console.log({ data, logs: data.logs });
  if (data.logs.length === 2) {
    return data.logs.filter((log) => log.topics.length === 3)[0].address;
  }
  const sender = data.from;
  const contract = getContract({
    address: FACTORY_ADDRESS,
    client: publicClient,
    abi,
  });
  const nftAddresses = await contract.read.getUserContent([sender]);
  if (nftAddresses.length > 0) {
    return nftAddresses[nftAddresses.length - 1];
  }
  return findNftAddressInLastThousandEvents(ipfsHash, transactionHash);
}
