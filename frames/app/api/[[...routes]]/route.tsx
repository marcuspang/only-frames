/** @jsxImportSource frog/jsx */

import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { Box, Heading, Text, VStack, vars } from "@/app/ui";
import { Button, Button, Frog, TextInput } from "frog";
import { neynar } from "frog/middlewares";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { createPublicClient, getContract, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import prisma from "../../prisma";
import { abi } from "./abi";
import { uploadTextData } from "./lighthouse";
import { paywallTokenABI as nftabi } from "./nftabi";

const app = new Frog({
  ui: { vars },
  assetsPath: "/",
  basePath: "/api",
}).use(neynar({ apiKey: "NEYNAR_FROG_FM", features: ["interactor", "cast"] }));

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

const FACTORY_ADDRESS = "0x85e9C8457b01D3Eae92796279044474C4E70416c";

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Private key not found");
}

app.frame("/", (c) => {
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4">
          <Heading>Welcome to OnlyFrames</Heading>
          <Text color="text200" size="20">
            Click a button below to get started.
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <Button action="/poster">Create Content</Button>,
      <Button action="/view">View Content</Button>,
    ],
  });
});

app.frame("/poster", (c) => {
  const { transactionId } = c;
  if (transactionId) {
    return c.res({
      image: (
        <Box
          grow
          alignHorizontal="center"
          alignVertical="center"
          backgroundColor="background"
          padding="32"
        >
          <VStack gap="4">
            <Heading>Transaction Submitted</Heading>
            <Text color="text200" size="20">
              Transaction hash: {c.transactionId}
            </Text>
          </VStack>
        </Box>
      ),
    });
  }
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4">
          <Heading>Create Paywalled Content</Heading>
        </VStack>
      </Box>
    ),
    intents: [<Button action="/poster/1">Get Started</Button>],
  });
});

app.frame("/poster/1", async (c) => {
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4">
          <Heading>Add Content</Heading>
          <Text color="text200" size="20">
            Please enter the content you want to upload in the input below. You
            can upload text, or ipfs hashes.
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <TextInput placeholder="Enter your content here" />,
      <Button action="/poster/2">Confirm Content</Button>,
    ],
  });
});

app.frame("/poster/2", async (c) => {
  const content = c.inputText;
  const fid = c.frameData?.fid;
  const address = c.var.interactor?.custodyAddress;

  let ipfsHash: string = "";

  if (fid && address && content) {
    // upload to ipfs
    const { data } = await uploadTextData(privateKey, content);
    ipfsHash = data.Hash;
    // add to database
    await prisma.content.create({
      data: {
        ipfsHash,
        posterAddress: address,
      },
    });
  }
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <Heading>Upload Content On-chain</Heading>
      </Box>
    ),
    intents: [
      <Button.Transaction
        target={`/create?ipfsHash=${ipfsHash}`}
        action="/poster/3"
      >
        Upload
      </Button.Transaction>,
    ],
  });
});

app.frame("/poster/3", async (c) => {
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4">
          <Heading>Done!</Heading>
        </VStack>
      </Box>
    ),
    intents: [
      <Button.Link href="https://only-frames.vercel.app">
        Click here to view your paywalled content.
      </Button.Link>,
    ],
  });
});

app.transaction("/create", async (c) => {
  const ipfsHash = c.req.query().ipfsHash;
  return c.contract({
    abi,
    functionName: "uploadContent",
    chainId: `eip155:${baseSepolia.id}`,
    to: FACTORY_ADDRESS,
    args: [c.address as Address, ipfsHash, BigInt(1), BigInt(0)],
  });
});

app.frame("/view/:id", async (c) => {
  const contentId = c.req.param().id;
  console.log({ a: c.var.interactor });
  if (!c.var.interactor?.custodyAddress) {
    return c.res({
      image: (
        <Box
          grow
          alignHorizontal="center"
          alignVertical="center"
          backgroundColor="background"
          padding="32"
        >
          <VStack gap="4">
            <Heading>Paywalled Content</Heading>
            <Text color="text200" size="20">
              Click the button below to view.
            </Text>
          </VStack>
        </Box>
      ),
      intents: [<Button action={`/view/${contentId}`}>View</Button>],
    });
  }
  if (c.transactionId) {
    return c.res({
      image: (
        <Box
          grow
          alignHorizontal="center"
          alignVertical="center"
          backgroundColor="background"
          padding="32"
        >
          <VStack gap="4">
            <Heading>Access Bought!</Heading>
            <Text color="text200" size="20">
              Refresh the frame by clicking the button below.
            </Text>
          </VStack>
        </Box>
      ),
      intents: [<Button action={`/view/${contentId}`}>Refresh</Button>],
    });
  }

  const content = await prisma.content.findFirst({
    where: {
      id: contentId,
    },
  });

  if (!c.var.interactor?.custodyAddress || !content) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          No data found :(
        </div>
      ),
    });
  }
  const eventLogs = await getFactoryEvents();
  const nftAddress = eventLogs.find(
    (log) => log.ipfsHash === content?.ipfsHash
  ) as Address;
  const nft = getContract({
    address: nftAddress,
    abi: nftabi,
    client: publicClient,
  });
  const balance = await nft.read?.balanceOf([
    c.var.interactor?.custodyAddress as Address,
  ]);
  if (+(balance as BigInt) > 0) {
    return c.res({
      image: (
        <Box
          grow
          alignHorizontal="center"
          alignVertical="center"
          backgroundColor="background"
          padding="32"
        >
          <Heading>Content Unlocked</Heading>
        </Box>
      ),
    });
  }

  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <Heading>Content Locked</Heading>
      </Box>
    ),
    intents: [
      <Button.Transaction
        action="tx"
        target={`/mint?ipfsHash=${content?.ipfsHash}`}
      >
        Mint
      </Button.Transaction>,
      <Button action="post">View</Button>,
    ],
  });
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

async function getFactoryEvents() {
  const logs = await publicClient.getContractEvents({
    address: FACTORY_ADDRESS,
    eventName: "ContentUploaded",
    fromBlock: BigInt(8567992),
    toBlock: BigInt(8569992),
    abi,
  });
  return logs.map((log) => log.args);
}

app.transaction("/mint", async (c) => {
  const ipfsHash = c.req.query().ipfsHash;
  const eventLogs = await getFactoryEvents();

  const nftAddress = eventLogs.find(
    (log) => log.ipfsHash === ipfsHash
  ) as Address;
  if (!nftAddress) {
    throw new Error("No NFT address");
  }

  return c.contract({
    abi: nftabi,
    functionName: "safeMint",
    chainId: `eip155:${baseSepolia.id}`,
    to: FACTORY_ADDRESS,
    args: [c.address as Address],
  });
});

if (process.env.NODE_ENV === "development")
  devtools(app, { serveStatic, appFid: 377365 });
else devtools(app, { assetsPath: "/.frog" });

export const GET = handle(app);
export const POST = handle(app);
