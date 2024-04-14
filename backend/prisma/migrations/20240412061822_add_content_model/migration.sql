-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "ipfsHash" TEXT NOT NULL,
    "posterAddress" TEXT NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);
