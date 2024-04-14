async function main() {

    const contractFactory = await ethers.getContractFactory("PriceConsumerV3");
    const contract = await contractFactory.deploy();

    console.log("******* Contract Deployed to address:", contract.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1);
})