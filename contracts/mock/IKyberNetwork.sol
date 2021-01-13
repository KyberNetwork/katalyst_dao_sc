pragma solidity 0.6.6;

import "@kyber.network/utils-sc/contracts/IERC20Ext.sol";


interface IKyberNetwork {
    event KyberTrade(
        IERC20Ext indexed src,
        IERC20Ext indexed dest,
        uint256 ethWeiValue,
        uint256 networkFeeWei,
        uint256 customPlatformFeeWei,
        bytes32[] t2eIds,
        bytes32[] e2tIds,
        uint256[] t2eSrcAmounts,
        uint256[] e2tSrcAmounts,
        uint256[] t2eRates,
        uint256[] e2tRates
    );

    function tradeWithHintAndFee(
        address payable trader,
        IERC20Ext src,
        uint256 srcAmount,
        IERC20Ext dest,
        address payable destAddress,
        uint256 maxDestAmount,
        uint256 minConversionRate,
        address payable platformWallet,
        uint256 platformFeeBps,
        bytes calldata hint
    ) external payable returns (uint256 destAmount);

    function listTokenForReserve(
        address reserve,
        IERC20Ext token,
        bool add
    ) external;

    function enabled() external view returns (bool);

    function getExpectedRateWithHintAndFee(
        IERC20Ext src,
        IERC20Ext dest,
        uint256 srcQty,
        uint256 platformFeeBps,
        bytes calldata hint
    )
        external
        view
        returns (
            uint256 expectedRateAfterNetworkFee,
            uint256 expectedRateAfterAllFees
        );

    function getNetworkData()
        external
        view
        returns (
            uint256 negligibleDiffBps,
            uint256 networkFeeBps,
            uint256 expiryTimestamp
        );

    function maxGasPrice() external view returns (uint256);
}
