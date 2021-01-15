pragma solidity 0.6.6;

import "@kyber.network/utils-sc/contracts/IERC20Ext.sol";


/*
 * @title simple Kyber Network proxy interface
 * add convenient functions to help with kyber proxy API
 */
interface ISimpleKyberProxy {
    function swapTokenToEther(
        IERC20Ext token,
        uint256 srcAmount,
        uint256 minConversionRate
    ) external returns (uint256 destAmount);

    function swapEtherToToken(IERC20Ext token, uint256 minConversionRate)
        external
        payable
        returns (uint256 destAmount);

    function swapTokenToToken(
        IERC20Ext src,
        uint256 srcAmount,
        IERC20Ext dest,
        uint256 minConversionRate
    ) external returns (uint256 destAmount);
}
