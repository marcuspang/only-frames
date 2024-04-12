"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  user: string;
  nftAddress: string;
  ipfsHash: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "user",
    header: "User",
  },
  {
    accessorKey: "nftAddress",
    header: "NFTAddress",
  },
  {
    accessorKey: "ipfsHash",
    header: "IPFSHash",
  },
];
