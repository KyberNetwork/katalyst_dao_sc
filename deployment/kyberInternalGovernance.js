const artifacts = require('hardhat').artifacts
const BN = web3.utils.BN;

const KyberInternalGovernance = artifacts.require('KyberInternalGovernance.sol');

const { ethAddress, zeroAddress, emptyHint } = require('../test/helper');

const Helper = require('../test/helper');

let deployer;

let operators = [
  '0xbe2f0354d970265bfc36d383af77f72736b81b54', // mike
  '0xf214dDE57f32F3F34492Ba3148641693058D4A9e', // victor
  '0xdE6BBD964b9D0148d46FE6e2E9Cf72B020ADc519', // sunny
  '0xf3d872b9e8d314820dc8e99dafbe1a3feedc27d5', // reserve hot wallet - S
  '0x417446168952735b8f51dF840a1838AE78104558', // shane
  '0x5565d64f29Ea17355106DF3bA5903Eb793B3e139', // loi
];
const dao = '0x49bdd8854481005bBa4aCEbaBF6e06cD5F6312e9';
const feeHandler = '0xd3d2b5643e506c6d9B7099E9116D7aAa941114fe';
const admin = '0x3eb01b3391ea15ce752d01cf3d3f09dec596f650';
const rewardRecipient = '0x43ec6ecffc1e9faab5627341c2186b08d4acdfc2';

async function main() {
  const accounts = await web3.eth.getAccounts();
  deployer = accounts[0];
  console.log(`Deployer address at ${deployer}`);

  gasPrice = new BN(114).mul(new BN(10).pow(new BN(9)));
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
