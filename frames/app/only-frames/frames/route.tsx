import { Button } from "frames.js/next";
import { frames } from "./frames";
import { uploadTextData } from "../../lighthouse";
import { Contract } from "ethers";
import prisma from "../../prisma";
import { getAddressesForFid } from "frames.js";

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

const handleRequest = frames(async (ctx) => {
  if (ctx.message?.transactionId) {
    return {
      imageOptions: {
        aspectRatio: "1:1",
      },
      image: (
        <div tw="w-full h-full justify-center items-center flex text-wrap">
          Transaction submitted! {ctx.message.transactionId}
        </div>
      ),
      buttons: [
        <Button
          key="asds"
          action="link"
          target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}
        >
          View on block explorer
        </Button>,
      ],
    };
  }
  const page = Number(ctx.searchParams?.pageIndex ?? 0);
  if (page === 0) {
    return {
      image: images[page]!.src,
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button
          key="button1"
          action="post"
          target={{
            query: {
              pageIndex: String((page + 1) % images.length),
            },
          }}
        >
          Get Started
        </Button>,
      ],
    };
  } else if (page === 1) {
    return {
      image: images[page]!.src,
      imageOptions: {
        aspectRatio: "1:1",
      },
      textInput: "Write Content",
      buttons: [
        <Button
          key="button2"
          action="post"
          target={{
            query: {
              pageIndex: String((page + 1) % images.length),
            },
          }}
        >
          Confirm Content
        </Button>,
      ],
    };
  } else if (page === 2) {
    const content = ctx.message?.inputText;
    const fid = ctx.message?.requesterFid;
    let ipfsHash: string = "";
    if (fid) {
      const addresses = await getAddressesForFid({
        fid,
      });
      if (content && addresses.length > 0) {
        // upload to ipfs
        const { data } = await uploadTextData(privateKey, content);
        ipfsHash = data.Hash;
        // add to database
        const createdContent = await prisma.content.create({
          data: {
            ipfsHash,
            posterAddress: addresses[0]!.address,
          },
        });
        console.log({ createdContent });
      }
    }
    // call contract
    return {
      image: images[page]!.src,
      imageOptions: {
        aspectRatio: "1:1",
      },
      textInput: content,
      buttons: [
        <Button
          key="button3"
          action="tx"
          post_url="/"
          target={{
            pathname: "/create",
            query: {
              ipfsHash,
            },
          }}
        >
          Upload Content on-chain
        </Button>,
      ],
    };
  } else if (page === 3) {
    return {
      image: images[page]!.src,
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button
          key="button4"
          action="post"
          target={{
            query: {
              pageIndex: String((page + 1) % images.length),
            },
          }}
        >
          Next
        </Button>,
      ],
    };
  }
  return {
    image: <div>Invalid page</div>,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
