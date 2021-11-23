const contractAddr = process.env.CONTRACT_ADDRESS;
const linkAddr = process.env.LINK_ADDRESS;

async function main() {
  const delayInsurance = await hre.ethers.getContractAt("DelayInsurance", addr);






  await tx.wait(); // mined

  await consumer.requestVolumeData();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
