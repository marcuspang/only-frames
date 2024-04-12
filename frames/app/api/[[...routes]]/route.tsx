/** @jsxImportSource frog/jsx */

import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { Button, Frog, TextInput } from "frog";
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
      <div
        style={{
          color: "white",
          display: "flex",
          flexDirection: "column",
          fontSize: 60,
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div>Welcome to OnlyFrames!</div>
        <div>Let's get you started.</div>
      </div>
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
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Transaction submitted!: {c.transactionId}
        </div>
      ),
    });
  }
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Let's get you started!
      </div>
    ),
    intents: [<Button action="/poster/1">Get Started</Button>],
  });
});

app.frame("/poster/:id", async (c) => {
  const { id } = c.req.param();
  if (+id === 1) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Please add your content in the input.
        </div>
      ),
      intents: [
        <TextInput placeholder="Enter your content here" />,
        <Button action="/poster/2">Confirm Content</Button>,
      ],
    });
  } else if (+id === 2) {
    const content = c.inputText;
    const fid = c.frameData?.fid;
    const address = c.var.interactor?.custodyAddress;
    let ipfsHash: string = "";
    if (fid && address) {
      if (content) {
        // upload to ipfs
        const { data } = await uploadTextData(privateKey, content);
        console.log("uploaded", data);
        ipfsHash = data.Hash;
        // add to database
        const createdContent = await prisma.content.create({
          data: {
            ipfsHash,
            posterAddress: address,
          },
        });
        console.log({ createdContent });
      }
    }
    // call contract
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          It's time to upload your content onchain!
        </div>
      ),
      intents: [
        <Button.Transaction
          target={`/create?ipfsHash=${ipfsHash}`}
          action="/poster/3"
        >
          Upload Content on-chain
        </Button.Transaction>,
      ],
    });
  } else if (+id === 3) {
    return c.res({
      image: images[3]!.src,
      intents: [
        <Button key="button4" action="post">
          Next
        </Button>,
      ],
    });
  }
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Let's get you started!
      </div>
    ),
    intents: [<Button action="/poster/1">Get Started</Button>],
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
  if (!c.var.interactor?.custodyAddress) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Paywalled, please click below to view
        </div>
      ),
      intents: [<Button action={`/view/${contentId}`}>View</Button>],
    });
  }
  if (c.transactionId) {
    return c.res({
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Transaction submitted! {c.transactionId}
        </div>
      ),
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
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Content is Unlocked!
        </div>
      ),
    });
  }

  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Content is Locked by OnlyFrames
      </div>
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

devtools(app, { serveStatic, appFid: 377365 });

export const GET = handle(app);
export const POST = handle(app);
