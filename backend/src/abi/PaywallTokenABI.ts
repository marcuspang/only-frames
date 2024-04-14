export const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "contentOwner",
        type: "address",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        internalType: "address",
        name: "curveAddress",
        type: "address",
      },
      {
        internalType: "uint128",
        name: "spotPrice",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "delta",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    type: "error",
    name: "ERC721IncorrectOwner",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    type: "error",
    name: "ERC721InsufficientApproval",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    type: "error",
    name: "ERC721InvalidApprover",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    type: "error",
    name: "ERC721InvalidOperator",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    type: "error",
    name: "ERC721InvalidOwner",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    type: "error",
    name: "ERC721InvalidReceiver",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    type: "error",
    name: "ERC721InvalidSender",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    type: "error",
    name: "ERC721NonexistentToken",
  },
  {
    inputs: [],
    type: "error",
    name: "InsufficientFunds",
  },
  {
    inputs: [],
    type: "error",
    name: "InvalidAddress",
  },
  {
    inputs: [],
    type: "error",
    name: "InvalidPrice",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    type: "error",
    name: "OwnableInvalidOwner",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    type: "error",
    name: "OwnableUnauthorizedAccount",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
        indexed: true,
      },
      {
        internalType: "address",
        name: "approved",
        type: "address",
        indexed: true,
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
        indexed: true,
      },
    ],
    type: "event",
    name: "Approval",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
        indexed: true,
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
        indexed: true,
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
        indexed: false,
      },
    ],
    type: "event",
    name: "ApprovalForAll",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "previousOwner",
        type: "address",
        indexed: true,
      },
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
        indexed: true,
      },
    ],
    type: "event",
    name: "OwnershipTransferred",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
        indexed: true,
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
        indexed: true,
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
        indexed: true,
      },
    ],
    type: "event",
    name: "Transfer",
    anonymous: false,
  },
  {
    inputs: [],
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "_contentOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "_curve",
    outputs: [
      {
        internalType: "contract ICurve",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "_delta",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "_ipfsHash",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "_spotPrice",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "approve",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    name: "renounceOwnership",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "retrieveFunds",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
    name: "safeMint",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "safeTransferFrom",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "safeTransferFrom",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "setApprovalForAll",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "transferFrom",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "transferOwnership",
  },
  {
    inputs: [],
    stateMutability: "payable",
    type: "receive",
  },
] as const;
