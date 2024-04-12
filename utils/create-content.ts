const fs = require("fs");
const ethers = require("ethers");
const lighthouse = require("@lighthouse-web3/sdk");

/**
 * Use this function to upload an encrypted text string to IPFS.
 *
 * @param {string} text - The text you want to upload.
 * @param {string} apiKey - Your unique Lighthouse API key.
 * @param {string} publicKey - Your wallet's public key.
 * @param {string} signedMessage - A message you've signed using your private key.
 * @param {string} [name] - optional name for text
 *
 * @return {object} - Details of the uploaded file on IPFS.
 */

// Read the private key from the file
const privateKeyPEM = fs.readFileSync("private_key.pem", "utf8");

// Create a wallet instance from the private key
const wallet = new ethers.Wallet(privateKeyPEM);

async function signMessage(message) {
  // Sign the message with the private key
  const signedMessage = await wallet.signMessage(message);
  return signedMessage;
}

const message = "Hello OnlyFrames";
const apiKey = "1b275c12.ddce0b7cd4ea4605a6bbdfea2be34881";
// const publicKey = "PLACE_YOUR_PUBLIC_KEY_HERE";
const signedMessage = signMessage(message);
const textName = "anime";

async function uploadTextToIPFS(
  message,
  apiKey,
  publicKey,
  signedMessage,
  name
) {
  try {
    const response = await lighthouse.textUploadEncrypted(
      message,
      apiKey,
      publicKey,
      signedMessage,
      name
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

async function testUpload() {
  const uploadResponse = await lighthouse.uploadText("hello world", apiKey);
  console.log(uploadResponse);
}

uploadTextToIPFS(message, apiKey, wallet.publicKey, signedMessage, textName);
//
//
// testUpload();
/* Sample Response
{
  data: {
    Name: 'anime',
    Hash: 'QmTsC1UxihvZYBcrA36DGpikiyR8ShosCcygKojHVdjpGd',
    Size: '67'
  }
}
*/
