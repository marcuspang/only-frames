export const abi = [
  {
    type: "constructor",
    inputs: [
      { name: "curveAddress", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getUserContent",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "uploadContent",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "ipfsHash", type: "string", internalType: "string" },
      { name: "spotPrice", type: "uint128", internalType: "uint128" },
      { name: "delta", type: "uint128", internalType: "uint128" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ContentUploaded",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "nftAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "ipfsHash",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
] as const;
