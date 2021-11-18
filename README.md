# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

### Get started

Install hardhat
`npm install --save-dev hardhat`

Export your [private key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) and get Alchemy API key on `Kovan` (testnet with faucet system currently working and compatible with Keepers).
Create `.env` file with the following properties:

```
ALCHEMY_API_KEY = XXXXXXXXXX
PRIVATE_KEY = XXXXXXXX
```

1. npx hardhat node
2. npx hardhat run scripts/deploy.js --network kovan
3. cd frontend && npm run start

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

### Test

Run the following command to perform the unit tests:
`npx hardhat test`

### Test coverage

`npx hardhat coverage`

### Run locally

`npx hardhat node` or `npx hardhat node --hostname 127.0.0.1`
`npx hardhat run scripts/deploy.js --network localhost`

### Deploy

`npx hardhat run scripts/deploy.js --network kovan`

### Frontend

```shell
cd frontend
npm install
npm start
```