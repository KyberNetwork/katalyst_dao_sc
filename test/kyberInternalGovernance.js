const Helper = require('./helper.js');
const BN = web3.utils.BN;

const MockKyberDao = artifacts.require('MockKyberDao.sol');
const FeeHandler = artifacts.require('KyberFeeHandler.sol');
const BurnKncSanityRate = artifacts.require('MockChainLinkSanityRate.sol');
const KyberInternalGovernance = artifacts.require('KyberInternalGovernance.sol');
const Token = artifacts.require('Token.sol');
const Proxy = artifacts.require('SimpleKyberProxy.sol');
const {BPS, precisionUnits, ethDecimals, ethAddress} = require('./helper.js');

const blockTime = 16; // each block is mined after 16s
const KNC_DECIMALS = 18;
const BURN_BLOCK_INTERVAL = 3;

let proxy;
let admin;
let daoSetter;
let daoOperator;
let mockKyberDao;
let knc;
let feeHandler;
let kyberInternalGovernance;
let recipient;

let rewardInBPS = new BN(8000);
let rebateInBPS = new BN(1000);
let stakerPercentageInPrecision;
let epoch;
let expiryTimestamp;

let rebateWallets = [];
let rebateBpsPerWallet = [];
let platformWallet;
let oneEth = new BN(10).pow(new BN(ethDecimals));
let oneKnc = new BN(10).pow(new BN(KNC_DECIMALS));

let ethWeiToBurn = oneEth.mul(new BN(2)); // 2 eth

let ethToKncPrecision = precisionUnits.div(new BN(200)); // 1 eth --> 200 knc
let kncToEthPrecision = precisionUnits.mul(new BN(200));

contract('KyberInternalGovernance', function (accounts) {
  before('Setting global variables', async () => {
    staker = accounts[8];
    daoSetter = accounts[1];
    daoOperator = accounts[2];
    admin = accounts[3];
    operator = accounts[4];

    platformWallet = accounts[1];
    rebateWallets.push(accounts[1]);
    rebateBpsPerWallet = [BPS];

    proxy = await Proxy.new();
    kyberNetwork = accounts[7];
    recipient = accounts[8];

    // deploy token
    knc = await Token.new('KyberNetworkCrystal', 'KNC', KNC_DECIMALS);

    await knc.transfer(proxy.address, oneKnc.mul(new BN(100000)));
    await Helper.sendEtherWithPromise(accounts[9], proxy.address, oneEth.mul(new BN(100)));

    // for burning KNC
    await proxy.setPairRate(ethAddress, knc.address, ethToKncPrecision);
    await proxy.setPairRate(knc.address, ethAddress, kncToEthPrecision);

    // setup sanity rate for ethFeeHandler
    sanityRate = await BurnKncSanityRate.new();
    await sanityRate.setLatestKncToEthRate(kncToEthPrecision);
  });

  describe('test claim reward', async () => {
    before('setup dao, feehandler and kyberInternalGovernance', async () => {
      // setup mockKyberDao
      epoch = new BN(0);
      expiryTimestamp = new BN(5);
      mockKyberDao = await MockKyberDao.new(rewardInBPS, rebateInBPS, epoch, expiryTimestamp);

      stakerPercentageInPrecision = precisionUnits.mul(rewardInBPS).div(BPS);
      await mockKyberDao.setStakerPercentageInPrecision(stakerPercentageInPrecision);

      // setup feeHandler
      feeHandler = await FeeHandler.new(
        daoSetter,
        proxy.address,
        kyberNetwork,
        knc.address,
        BURN_BLOCK_INTERVAL,
        daoOperator
      );
      await feeHandler.setDaoContract(mockKyberDao.address, {from: daoSetter});
      await feeHandler.setBurnConfigParams(sanityRate.address, ethWeiToBurn, {from: daoOperator});
      await feeHandler.getBRR();

      // setup kyberInternalGovernance
      kyberInternalGovernance = await KyberInternalGovernance.new(
        admin,
        recipient,
        mockKyberDao.address,
        feeHandler.address
      );
    });

    it('test claim reward', async () => {
      await sendFeesToFeeHandler(mockKyberDao, feeHandler, 10);

      let epochs = [1,2,3,4,5];
      let balanceBefore = await Helper.getBalancePromise(recipient);
      await kyberInternalGovernance.claimRewards(epochs);
      let balanceAfter = await Helper.getBalancePromise(recipient);
      let expectReward = new BN(0);
      for(let i = 0; i < epochs.length; i++) {
        let rPercentage = await mockKyberDao.getPastEpochRewardPercentageInPrecision(kyberInternalGovernance.address, epochs[i]);
        let reward = await feeHandler.rewardsPerEpoch(epochs[i]);
        expectReward = expectReward.add(rPercentage.mul(reward).div(precisionUnits));
      }
      Helper.assertEqual(balanceAfter.sub(balanceBefore), expectReward);
      balanceBefore = balanceAfter;
      await kyberInternalGovernance.claimRewards(epochs);
      balanceAfter = await Helper.getBalancePromise(recipient);
      Helper.assertEqual(balanceAfter.sub(balanceBefore), new BN(0));
    });
  });

  describe(`test withdraw fund`, async() => {
    before(`init data`, async() => {
      // setup kyberInternalGovernance
      kyberInternalGovernance = await KyberInternalGovernance.new(
        admin,
        recipient,
        accounts[0],
        accounts[1]
      );
    });

    it(`test withdraw funds`, async() => {
      let tokenAmount = new BN(1000);
      await knc.transfer(kyberInternalGovernance.address, tokenAmount);
      let balanceBefore = await knc.balanceOf(recipient);
      let withdrawAmount = tokenAmount.div(new BN(3));
      await kyberInternalGovernance.withdrawFund([knc.address], [withdrawAmount], { from: admin });
      let balanceAfter = await knc.balanceOf(recipient);
      Helper.assertEqual(balanceAfter.sub(balanceBefore), withdrawAmount);

      let ethAmount = new BN(10000);
      await Helper.sendEtherWithPromise(accounts[0], kyberInternalGovernance.address, ethAmount);
      balanceBefore = await Helper.getBalancePromise(recipient);
      withdrawAmount = ethAmount.div(new BN(3));
      await kyberInternalGovernance.withdrawFund([ethAddress], [withdrawAmount], { from: admin });
      balanceAfter = await Helper.getBalancePromise(recipient);
      Helper.assertEqual(balanceAfter.sub(balanceBefore), withdrawAmount);
    });
  });
});

async function sendFeesToFeeHandler(dao, feeHandler, numEpochs) {
  for (let i = 0; i < numEpochs; i++) {
    sendVal = oneEth.add(oneEth);
    await feeHandler.handleFees(ethAddress, rebateWallets, rebateBpsPerWallet, platformWallet, oneEth, oneEth, {
      from: kyberNetwork,
      value: sendVal,
    });
    // advance by 1 epoch
    await advanceEpoch(dao, 1);
  }
}

async function advanceEpoch(dao, numEpochs) {
  for (let i = 0; i < numEpochs; i++) {
    await dao.advanceEpoch();
    await Helper.mineNewBlockAfter(blocksToSeconds((await dao.epochPeriod()).toNumber()));
  }
}

const blocksToSeconds = function (blocks) {
  return blocks * blockTime;
};
