# General Workflow

## Poster User Flow

1. create and upload content in /post frame
2. we send a message to poster, with the correct content to share /post/:id

## Viewer User Flow

1. user loads frame at /post/:id
2. server checks if user has nft of /post/:id
   2a. retrieve db entry
   2b. retrieve ipfs data with ipfs hash
   2c. check if requestor's address has NFT of :id
   2d. if yes, decrypt the ipfs data and render it
   2e. otherwise, display nothing ("PAYWALLED")
3. if user does not have access, add a buy button
   3a. mint() on nft address
   3b. if succeeded, load the frame by going to 1.

## Architecture

`PaywallTokenFactory.sol`

- poster address => 721 address

entry point when creating a paywalled content

`PaywallToken.sol`

- ipfs hash
- content owner

used to check whether user has access to paywalled content

Database

id => ipfsHash, poster address, nft address

## Future Implementations

1. add a home page
   - upload custom content
   - view all posted content
   - view all content that you bought
   - subscription per user instead of per post
