import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { neynar } from "frog/middlewares";
import { serveStatic } from "frog/serve-static";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/vercel";
import { createPublicClient, getContract, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { FrameWithText } from "../components/FrameWithText.js";
import { paywallTokenABI as nftAbi } from "../lib/contracts/PaywallTokenABI.js";
import { abi } from "../lib/contracts/PaywallTokenFactoryABI.js";
import { uploadTextData } from "../lib/lighthouse.js";
import prisma from "../lib/prisma.js";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
}).use(neynar({ apiKey: "NEYNAR_FROG_FM", features: ["interactor", "cast"] }));

const FACTORY_ADDRESS = "0x85e9C8457b01D3Eae92796279044474C4E70416c";

const privateKey = import.meta.env.VITE_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("No private key found");
}

app.frame("/", (c) => {
  return c.res({
    image: <FrameWithText title="Welcome!" />,
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
        <FrameWithText
          title="Transaction Submitted"
          description={`Transaction hash: ${transactionId}`}
        />
      ),
    });
  }
  return c.res({
    image: <FrameWithText title="Create paywalled content" />,
    intents: [<Button action="/poster/1">Get Started</Button>],
  });
});

app.frame("/poster/1", async (c) => {
  return c.res({
    image: (
      <FrameWithText
        title="Add Content"
        description={`Please enter the content you want to upload in the input below. You
        can upload text, or ipfs hashes.`}
      />
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
    image: <FrameWithText title="Upload content on-chain" />,
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
    image: <FrameWithText title="Done!" />,
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
        <FrameWithText
          title="Paywalled Content"
          description={`Click the button below to view`}
        />
      ),
      intents: [<Button action={`/view/${contentId}`}>View</Button>],
    });
  }
  if (c.transactionId) {
    return c.res({
      image: (
        <FrameWithText
          title="Access bought!"
          description={`Refresh to view the content`}
        />
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
      image: <FrameWithText title="No data found :(" />,
    });
  }
  const eventLogs = await getFactoryEvents();
  const nftAddress = eventLogs.find(
    (log) => log.ipfsHash === content?.ipfsHash
  ) as Address;
  const nft = getContract({
    address: nftAddress,
    abi: nftAbi,
    client: publicClient,
  });
  const balance = await nft.read?.balanceOf([
    c.var.interactor?.custodyAddress as Address,
  ]);
  if (+(balance as BigInt) > 0) {
    return c.res({
      image: <FrameWithText title="Content Unlocked" />,
    });
  }

  return c.res({
    image: <FrameWithText title="Content Locked" />,
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

  const nftAddress = eventLogs.find((log) => log.ipfsHash === ipfsHash);
  if (!nftAddress || !nftAddress.nftAddress) {
    throw new Error("No NFT address found");
  }

  return c.contract({
    abi: nftAbi,
    functionName: "safeMint",
    chainId: `eip155:${baseSepolia.id}`,
    to: nftAddress.nftAddress,
    args: [c.address as Address],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
