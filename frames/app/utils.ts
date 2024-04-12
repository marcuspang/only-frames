import { headers } from "next/headers";
import { createPublicClient, http } from "viem";
import { baseSepolia, mainnet } from "viem/chains";
import { abi } from "./only-frames/frames/create/abi";
import { FACTORY_ADDRESS } from "./only-frames/frames/create/route";

export function currentURL(pathname: string): URL {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";

  try {
    return new URL(pathname, `${protocol}://${host}`);
  } catch (error) {
    return new URL("http://localhost:3000");
  }
}

export function vercelURL() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
}

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function getFactoryEvents() {
  const logs = await publicClient.getContractEvents({
    address: FACTORY_ADDRESS,
    eventName: "ContentUploaded",
    fromBlock: 8567992n,
    abi,
  });
  return logs.map((log) => log.args);
}
