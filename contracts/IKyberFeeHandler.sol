pragma solidity 0.6.6;

import "@kyber.network/utils-sc/contracts/IERC20Ext.sol";


interface IKyberFeeHandler {
    event RewardPaid(address indexed staker, uint256 indexed epoch, IERC20Ext indexed token, uint256 amount);
    event RebatePaid(address indexed rebateWallet, IERC20Ext indexed token, uint256 amount);
    event PlatformFeePaid(address indexed platformWallet, IERC20Ext indexed token, uint256 amount);
    event KncBurned(uint256 kncTWei, IERC20Ext indexed token, uint256 amount);

    function handleFees(
        IERC20Ext token,
        address[] calldata eligibleWallets,
        uint256[] calldata rebatePercentages,
        address platformWallet,
        uint256 platformFee,
        uint256 networkFee
    ) external payable;

    function claimReserveRebate(address rebateWallet) external returns (uint256);

    function claimPlatformFee(address platformWallet) external returns (uint256);

    function claimStakerReward(
        address staker,
        uint256 epoch
    ) external returns(uint amount);
}
