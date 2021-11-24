# Ocean Storm by InsureBlox

Ocean Storm is a parametric insurance solution ☂ for ships 🚢 going through rough seas 🌊 based on Blockchain 🚀, i.e. hazzle-free, automatic pay-outs in case of adverse weather events.

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

### Running locally

`npx hardhat node` or `npx hardhat node --hostname 127.0.0.1`
`npx hardhat run scripts/deploy.js --network localhost`
> ℹ️  Connect metamask to Localhost:8545: RPC URL: http://localhost:8545 | Chain ID: 31337

### Deploy

`npx hardhat run scripts/deploy.js --network kovan`

### Frontend

Add and `.env` under `/frontend` folder with the following instruction:

`SKIP_PREFLIGHT_CHECK=true` 

See more [details](https://newbedev.com/javascript-skip-preflight-check-true-to-an-env-file-in-your-project-code-example)

```shell
cd frontend
npm install
npm start
```
