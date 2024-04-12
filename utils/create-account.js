const ethers = require("ethers");
const fs = require("fs");

// Generate a new Ethereum wallet
const wallet = ethers.Wallet.createRandom();

// Get the private key
const privateKey = wallet.privateKey;
console.log("Private Key:", privateKey);

// Get the public key
const publicKey = wallet.publicKey;
console.log("Public Key:", publicKey);

// Get the Ethereum address
const address = wallet.address;
console.log("Ethereum Address:", address);

async function testKeySigning() {
  // Create a test message to sign
  const message = "This is a test message.";

  // Sign the message with the private key
  const signature = await wallet.signMessage(message);
  console.log("Signature:", signature);

  // Verify the signed message
  const recoveredAddress = ethers.verifyMessage(message, signature);
  console.log("Recovered Address:", recoveredAddress);

  // Verify the signature matches the public key
  console.log(
    "Signature Valid:",
    recoveredAddress.toLowerCase() === address.toLowerCase()
  );

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    console.log("Key signing test failed!");
    process.exit(1);
  }
}

testKeySigning();

// Save the private key to a file
fs.writeFileSync("private_key.pem", privateKey);

// Save the public key (address) to a file
fs.writeFileSync("public_key.pem", publicKey);
