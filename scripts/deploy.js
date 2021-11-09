async function main() {

  const DelayInsurance = await ethers.getContractFactory("DelayInsurance");
  const delayInsurance = await DelayInsurance.deploy();

  await delayInsurance.deployed();

  console.log("consumer deployed to:", delayInsurance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
