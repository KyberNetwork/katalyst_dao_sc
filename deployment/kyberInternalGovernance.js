const artifacts = require('hardhat').artifacts
const BN = web3.utils.BN;

const KyberInternalGovernance = artifacts.require('KyberInternalGovernance.sol');

const { ethAddress, zeroAddress, emptyHint } = require('../test/helper');

const Helper = require('../test/helper');

let deployer;

let operators = [];
const dao = '0x49bdd8854481005bBa4aCEbaBF6e06cD5F6312e9';
const feeHandler = '0xd3d2b5643e506c6d9B7099E9116D7aAa941114fe';
const admin = '';
const rewardRecipient = '';

async function main() {
  const accounts = await web3.eth.getAccounts();
  deployer = accounts[0];
  console.log(`Deployer address at ${deployer}`);

  gasPrice = new BN(10).mul(new BN(10).pow(new BN(9)));
  console.log(`Sending transactions with gas price: ${gasPrice.toString(10)} (${gasPrice.div(new BN(10).pow(new BN(9))).toString(10)} gweis)`);

  for(let i = 0; i < operators.length; i++) {
    let governance = await KyberInternalGovernance.new(
      admin,
      rewardRecipient,
      dao,
      feeHandler,
      operators[i],
      { gasPrice: gasPrice }
    );
    console.log(`Deployed internal governance contract for operator: ${operators[i]}: ${governance.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
