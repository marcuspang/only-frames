import {
  decryptFile,
  fetchEncryptionKey,
  getAuthMessage,
  textUploadEncrypted,
} from "@lighthouse-web3/sdk";
import { Wallet } from "ethers";

const LIGHTHOUSE_API_KEY = "1b275c12.ddce0b7cd4ea4605a6bbdfea2be34881";
const TEXT_NAME = "OnlyFrames";

async function signAuthMessage(wallet: Wallet) {
  const publicKey = await wallet.getAddress();
  const authMessage = await getAuthMessage(publicKey);
  const signedMessage = await wallet.signMessage(authMessage.data.message);
  return signedMessage;
}

export async function uploadTextData(privateKey: string, message: string) {
  const wallet = new Wallet(privateKey);
  const signedMessage = await signAuthMessage(wallet);
  const publicKey = await wallet.getAddress();
  const response = await textUploadEncrypted(
    message,
    LIGHTHOUSE_API_KEY,
    publicKey,
    signedMessage,
    TEXT_NAME
  );
  return response;
}

export const decryptTextData = async (cid: string, privateKey: string) => {
  // const cid = "QmPXk3Z3Gx3vFJkePPZHk1NpKA7JFYAxatqgeNLD3qZwuP"; //Example: 'QmbGN1YcBM25s6Ry9V2iMMsBpDEAPzWRiYQQwCTx7PPXRZ'
  const wallet = new Wallet(privateKey);
  const publicKey = await wallet.getAddress();

  // Get file encryption key
  const signedMessage = await signAuthMessage(wallet);
  const fileEncryptionKey = await fetchEncryptionKey(
    cid,
    publicKey,
    signedMessage
  );

  // Decrypt File
  const decrypted = await decryptFile(cid, fileEncryptionKey.data?.key!);
  return Buffer.from(decrypted).toString("utf-8");
};
