import hre from "hardhat";

async function main() {
    console.log("Deploying SupplyChain contract...");

    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();

    await supplyChain.waitForDeployment();

    const address = await supplyChain.getAddress();
    console.log(`✅ SupplyChain deployed to: ${address}`);
    console.log(`\nUpdate constants.js with:\nexport const contractAddress = '${address}';`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
