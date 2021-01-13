require("@nomiclabs/hardhat-ethers");

let dao = "0x2Be7dC494362e4FCa2c228522047663B17aE17F9";
let admin = "0xea058bEa72a251039C2c9C9C103fD2a9335a781F";

task("mulRewards", "multiple rewards deployer")
  .setAction(async() => {
    // contract deployment
    console.log("deploying multiple rewards contract...");
    const MR = await ethers.getContractFactory("MultipleEpochRewardsClaimer");
    const mr = await MR.deploy(dao, admin);
    await mr.deployed();
    console.log(`multipleRewards address: ${mr.address}`);
    process.exit(0);
});
