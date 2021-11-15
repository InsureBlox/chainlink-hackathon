async function main() {

  const DelayInsurance = await ethers.getContractFactory("DelayInsurance");
  const delayInsurance = await DelayInsurance.deploy();
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);
  await delayInsurance.deployed();
  console.log("consumer deployed to:", delayInsurance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
