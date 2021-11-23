const contractAddr = process.env.CONTRACT_ADDRESS;
const linkAddr = process.env.LINK_ADDRESS;

async function main() {
  const delayInsurance = await hre.ethers.getContractAt("DelayInsurance", addr);

  // Create insurance policy
  await delayInsurance.subscribePolicy(
    "b8625b67-7142-cfd1-7b85-595cebfe4191",
    100,
    974448412,
    1763366812,
    1000,
    200000
  )

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
