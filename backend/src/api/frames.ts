import type { Content } from "@prisma/client";
import express from "express";
import { type Address, type Hex } from "viem";
import { decryptTextData, uploadTextData } from "../lib/lighthouse";
import prisma from "../lib/prisma";
import {
  checkIfUserHasAccessToContent,
  getCreatedNftAddress,
} from "../lib/viem";

const router = express.Router();

type CreateFrameRequestBody = {
  content: string;
  address: string;
};

type CreateFrameResponse = {
  success: boolean;
  ipfsHash?: string;
  id?: string;
};

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("No private key found");
}

router.post<{}, CreateFrameResponse, CreateFrameRequestBody>(
  "/",
  async (req, res) => {
    const { content, address } = req.body;
    try {
      const { data } = await uploadTextData(privateKey, content);
      const ipfsHash = data.Hash;
      // add to database
      const createdContent = await prisma.content.create({
        data: {
          ipfsHash,
          posterAddress: address,
        },
      });
      return res.status(201).json({
        success: true,
        ipfsHash,
        id: createdContent.id,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
      });
    }
  }
);

type SyncFrameRequestBody = {
  ipfsHash: string;
  transactionHash: string;
};

type SyncFrameResponse = {
  success: boolean;
};

router.post<{}, SyncFrameResponse, SyncFrameRequestBody>(
  "/sync",
  async (req, res) => {
    const { ipfsHash, transactionHash } = req.body;
    const nftAddress = await getCreatedNftAddress(
      ipfsHash,
      transactionHash as Hex
    );
    if (!nftAddress) {
      console.error(
        `No NFT address found in last 1000 events for ${ipfsHash} or ${transactionHash}`
      );
      return res.status(404).json({
        success: false,
      });
    }
    try {
      // update database
      await prisma.content.update({
        where: {
          ipfsHash,
        },
        data: {
          nftAddress,
        },
      });
      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
      });
    }
  }
);

type GetFrameResponse = {
  success: boolean;
  content?: Content;
  decryptedData?: string;
};

router.get<{ id: string }, GetFrameResponse>("/:id", async (req, res) => {
  const { id } = req.params;
  const { address } = req.query;
  try {
    const content = await prisma.content.findUnique({
      where: {
        id,
      },
    });
    if (!content) {
      return res.status(404).json({
        success: false,
      });
    }
    // if address is sent, check if user has access and decrypt the ipfs content
    if (address && content.nftAddress) {
      const hasAccess = await checkIfUserHasAccessToContent(
        content.nftAddress as Address,
        address as Address
      );
      if (hasAccess) {
        const decryptedData = await decryptTextData(
          content.ipfsHash,
          privateKey
        );
        return res.status(200).json({
          success: true,
          content,
          decryptedData,
        });
      }
    }
    return res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
    });
  }
});

export default router;
