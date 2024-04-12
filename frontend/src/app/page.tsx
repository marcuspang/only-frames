"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { abi } from "./abi";
import { createConfig, useWatchContractEvent } from "wagmi";

const FACTORY_ADDRESS = "0x85e9C8457b01D3Eae92796279044474C4E70416c";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export default function Home() {
  const [data, setData] = useState(null);
  // useWatchContractEvent({
  //   address: FACTORY_ADDRESS,
  //   abi,
  //   config,
  //   eventName: "ContentUploaded",
  //   onLogs(logs) {
  //     console.log("New logs!", logs);
  //   },
  // });
  async function getFactoryEvents() {
    console.log("Getting events");
    const logs = await publicClient.getContractEvents({
      address: FACTORY_ADDRESS,
      eventName: "ContentUploaded",
      fromBlock: BigInt(8567992),
      toBlock: BigInt(8569476),
      abi,
    });
    console.log("Logs", logs);
    setData(logs.map((log) => log.args));
  }
  useEffect(() => {
    const interval = setInterval(getFactoryEvents, 5000); // Run fetchData every 5 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>
        <h1 className="text-4xl font-bold">OnlyFrames</h1>
        <p className="text-lg text-muted-foreground">
          Bringing NFT gated content to Farcaster on Base!
        </p>
      </div>
      <div className="container mx-auto py-10">
        {data === null ? (
          <p>Loading...</p>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </main>
  );
}
