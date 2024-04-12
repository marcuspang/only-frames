/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "./frames";
import prisma from "../../prisma";

const handleRequest = frames(async (ctx) => {
  console.log(ctx.request);

  if (ctx.message?.transactionId) {
    return {
      image: (
        <div tw="bg-purple-800 text-white w-full h-full justify-center items-center flex">
          Transaction submitted! {ctx.message.transactionId}
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button
          action="link"
          target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}
        >
          View on block explorer
        </Button>,
      ],
    };
  }
  const contentId = ctx.searchParams?.id;
  if (!contentId) {
    return {
      image: (
        <div tw="bg-blue-800 text-white w-full h-full justify-center items-center text-5xl">
          No data found :(
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1",
      },
    };
  }

  const content = await prisma.content.findFirst({
    where: {
      id: contentId,
    },
  });
  if (!content) {
    console.error("No content found");
    return {
      image: (
        <div tw="bg-blue-800 text-white w-full h-full justify-center items-center text-5xl">
          No data found :(
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1",
      },
    };
  }

  return {
    image: (
      <div tw="bg-blue-800 text-white w-full h-full justify-center items-center text-5xl">
        Content is Locked by OnlyFrames
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button
        action="tx"
        target={{
          pathname: "/txdata",
          query: {
            ipfsHash: content?.ipfsHash,
          },
        }}
        post_url="/frames"
      >
        Mint
      </Button>,
      <Button action="post" target="/view">
        View
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
