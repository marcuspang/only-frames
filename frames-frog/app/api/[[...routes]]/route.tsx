/** @jsxImportSource frog/jsx */

import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { Button, Frog, TextInput } from "frog";
import { neynar } from "frog/middlewares";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import type { Address } from "viem";
import { baseSepolia } from "viem/chains";
import prisma from "../../prisma";
import { abi } from "./abi";
import { uploadTextData } from "./lighthouse";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
}).use(neynar({ apiKey: "NEYNAR_FROG_FM", features: ["interactor", "cast"] }));

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

export const FACTORY_ADDRESS = "0x85e9C8457b01D3Eae92796279044474C4E70416c";

const images: {
  src: string;
}[] = [
  {
    src: "https://ipfs.decentralized-content.com/ipfs/bafybeifs7vasy5zbmnpixt7tb6efi35kcrmpoz53d3vg5pwjz52q7fl6pq/cook.png",
  },
  {
    src: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeiegrnialwu66u3nwzkn4gik4i2x2h4ip7y3w2dlymzlpxb5lrqbom&w=1920&q=75",
  },
  {
    src: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeiegrnialwu66u3nwzkn4gik4i2x2h4ip7y3w2dlymzlpxb5lrqbom&w=1920&q=75",
  },
];

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Private key not found");
}

app.frame("/poster", (c) => {
  const { transactionId } = c;
  if (transactionId) {
    return c.res({
      image: <div>Transaction submitted! {c.transactionId}</div>,
    });
  }
  return c.res({
    image: images[0]!.src,
    intents: [<Button action="/poster/1">Get Started</Button>],
  });
});

app.frame("/poster/:id", async (c) => {
  const { id } = c.req.param();
  if (+id === 1) {
    return c.res({
      image: images[1]!.src,
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
      image: images[2]!.src,
      intents: [
        <Button.Transaction
          target={`/create?ipfsHash=${ipfsHash}`}
          // target={{
          //   pathname: "/create",
          //   query: {
          //     ipfsHash,
          //   },
          // }}
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
    image: images[0]!.src,
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
    args: [c.address as Address, ipfsHash, 1n, 0n],
  });
});

devtools(app, { serveStatic, appFid: 377365 });

export const GET = handle(app);
export const POST = handle(app);
