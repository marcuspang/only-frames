/** @jsxImportSource frog/jsx */

import { uploadTextData } from "@/app/api/[[...routes]]/lighthouse";
import page from "@/app/page";
import prisma from "@/app/prisma";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

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
      image: (
        <div tw="w-full h-full justify-center items-center flex text-wrap">
          Transaction submitted! {c.transactionId}
        </div>
      ),
    });
  }
  return c.res({
    image: images[0]!.src,
    intents: [<Button.Link href="/poster/1">Get Started</Button.Link>],
  });
});

app.frame("/poster/:id", async (c) => {
  const { id } = c.req.param();
  if (+id === 1) {
    return c.res({
      image: images[1]!.src,
      intents: [<Button.Link href="/poster/2">Confirm Content</Button.Link>],
    });
  } else if (+id === 2) {
    const content = c.inputText;
    const fid = c.frameData?.fid;
    const address = c.frameData?.address;
    let ipfsHash: string = "";
    if (fid && address) {
      if (content) {
        // upload to ipfs
        const { data } = await uploadTextData(privateKey, content);
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
    intents: [<Button.Link href="/poster/1">Get Started</Button.Link>],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
