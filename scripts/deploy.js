async function main() {
  const [deployer] = await ethers.getSigners();
  const Contract = await ethers.getContractFactory("CertificateVerifier");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  console.log("Deployed to:", await contract.getAddress());
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
