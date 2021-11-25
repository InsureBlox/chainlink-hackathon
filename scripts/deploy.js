async function main() {

  const DelayInsurance = await ethers.getContractFactory("DelayInsurance");
  const delayInsurance = await DelayInsurance.deploy();
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);
  await delayInsurance.deployed();
  console.log("🔥🔥🔥 Contract Deployed: https://kovan.etherscan.io/address/" + delayInsurance.address);

  saveFrontendFiles(delayInsurance);
}

function saveFrontendFiles(delayInsuranceContract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Contract: delayInsuranceContract.address }, undefined, 2)
  );

  const DelayInsuranceArtifact = artifacts.readArtifactSync("DelayInsurance");

  fs.writeFileSync(
    contractsDir + "/InsuranceContract.json",
    JSON.stringify(DelayInsuranceArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
