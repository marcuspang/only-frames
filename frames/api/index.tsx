import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { neynar } from "frog/middlewares";
import { serveStatic } from "frog/serve-static";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/vercel";
import { createPublicClient, getContract, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { abi as nftAbi } from "../lib/contracts/PaywallTokenABI.js";
import { abi as factoryAbi } from "../lib/contracts/PaywallTokenFactoryABI.js";
import { getContent, syncContent, uploadContent } from "../lib/backend.js";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

function FrameWithText({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        background: "black",
        textAlign: "center",
        padding: "30px",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 60,
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          style={{
            fontSize: 40,
            color: "white",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
}).use(neynar({ apiKey: "NEYNAR_FROG_FM", features: ["interactor", "cast"] }));

const FACTORY_ADDRESS = "0xeD979fC9548dee08cE4a0A1FA8910846CCAAB416";

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

  if (fid && address && content) {
    const { ipfsHash, id } = await uploadContent({
      content,
      address,
    });
    let actionUrl = `/poster/3`;
    if (ipfsHash && id) {
      actionUrl += `/${ipfsHash}/${id}`;
    }
    return c.res({
      image: <FrameWithText title="Upload content on-chain" />,
      intents: [
        <Button.Transaction
          target={`/create?ipfsHash=${ipfsHash}`}
          action={actionUrl}
        >
          Upload
        </Button.Transaction>,
      ],
    });
  }
  return c.res({
    image: <FrameWithText title="An error has occurred" />,
  });
});

app.frame("/poster/3", async (c) => {
  return c.res({
    image: <FrameWithText title="Done!" />,
    intents: [
      <Button.Link href="https://only-frames.vercel.app">
        View all paywalled content
      </Button.Link>,
    ],
  });
});

app.frame("/poster/3/:ipfsHash/:id", async (c) => {
  const ipfsHash = c.req.param().ipfsHash;
  const id = c.req.param().id;

  if (ipfsHash && c.transactionId) {
    await syncContent({
      ipfsHash,
      transactionHash: c.transactionId,
    });
  }
  if (id) {
    return c.res({
      image: <FrameWithText title="Done!" />,
      intents: [
        <Button.Link href={`https://warpcast.com/~/compose?text=https://only-frames.vercel.app/api/view/${id}`}>Share</Button.Link>,
        <Button action={`/view/${id}`}>View Now</Button>,
        <Button.Link href="https://only-frames.vercel.app">
          View All
        </Button.Link>,
      ],
    });
  }
  return c.res({
    image: <FrameWithText title="Done!" />,
    intents: [
      <Button.Link href="https://only-frames.vercel.app">
        View all paywalled content
      </Button.Link>,
    ],
  });
});

app.transaction("/create", async (c) => {
  const ipfsHash = c.req.query().ipfsHash;
  return c.contract({
    abi: factoryAbi,
    functionName: "uploadContent",
    chainId: `eip155:${baseSepolia.id}`,
    to: FACTORY_ADDRESS,
    args: [c.address as Address, ipfsHash, BigInt(1), BigInt(0)],
  });
});

app.frame("/view/:id", async (c) => {
  const contentId = c.req.param().id;
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
  const custodyAddress = c.var.interactor?.custodyAddress;
  const { content, decryptedData } = await getContent(
    contentId,
    custodyAddress
  );
  if (!custodyAddress || !content?.nftAddress) {
    return c.res({
      image: <FrameWithText title="No data found :(" />,
    });
  }
  if (decryptedData) {
    return c.res({
      image: (
        <FrameWithText
          title="Content Unlocked"
          description={decryptedData}
        />
      ),
    });
  }

  return c.res({
    image: (
      <FrameWithText
        title="Content Locked"
        description="Mint the NFT below to your custody address to get access to this content"
      />
    ),
    intents: [
      <Button.Transaction
        action={`/view/${contentId}`}
        target={`/mint?nftAddress=${content.nftAddress}`}
      >
        Mint
      </Button.Transaction>,
    ],
  });
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

app.transaction("/mint", async (c) => {
  const nftAddress = c.req.query().nftAddress;

  const nft = getContract({
    address: nftAddress as Address,
    abi: nftAbi,
    client: publicClient,
  });
  const value = (await nft.read.getNextBuyPrice()) as bigint;
  if (!c.var.interactor?.custodyAddress) {
    throw new Error("No custody address found");
  }
  return c.contract({
    abi: nftAbi,
    functionName: "safeMint",
    chainId: `eip155:${baseSepolia.id}`,
    to: nftAddress as Address,
    args: [c.var.interactor?.custodyAddress as Address],
    value,
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
