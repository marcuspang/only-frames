import {
  decryptFile,
  fetchEncryptionKey,
  getAuthMessage,
  textUploadEncrypted,
} from "@lighthouse-web3/sdk";
import type { Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY!;
if (!LIGHTHOUSE_API_KEY) {
  throw new Error("No Lighthouse API key found");
}
const TEXT_NAME = "OnlyFrames";

async function signAuthMessage(account: PrivateKeyAccount) {
  const authMessage = await getAuthMessage(account.address);
  const signedMessage = await account.signMessage({
    message: authMessage.data.message,
  });
  return signedMessage;
}

export async function uploadTextData(privateKey: string, message: string) {
  const account = privateKeyToAccount(privateKey as Hex);
  const signedMessage = await signAuthMessage(account);
  const response = await textUploadEncrypted(
    message,
    LIGHTHOUSE_API_KEY,
    account.address,
    signedMessage,
    TEXT_NAME
  );
  return response;
}

export const decryptTextData = async (cid: string, privateKey: string) => {
  const account = privateKeyToAccount(privateKey as Hex);

  // Get file encryption key
  const signedMessage = await signAuthMessage(account);
  const fileEncryptionKey = await fetchEncryptionKey(
    cid,
    account.address,
    signedMessage
  );

  // Decrypt File
  const decrypted = await decryptFile(cid, fileEncryptionKey.data?.key!);
  return Buffer.from(decrypted).toString("utf-8");
};
