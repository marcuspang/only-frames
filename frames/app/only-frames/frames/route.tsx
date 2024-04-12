import { Button } from "frames.js/next";
import { frames } from "./frames";

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

const handleRequest = frames(async (ctx) => {
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
          Send Content
        </Button>,
      ],
    };
  } else if (page === 2) {
    const content = ctx.message?.inputText;

    // create the record
    // show a link
    return {
      image: images[page]!.src,
      imageOptions: {
        aspectRatio: "1:1",
      },
      textInput: content,
      buttons: [
        <Button
          key="button3"
          action="post"
          target={{
            query: {
              pageIndex: String((page + 1) % images.length),
            },
          }}
        >
          Try now
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
