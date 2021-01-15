pragma solidity 0.6.6;

import "@kyber.network/utils-sc/contracts/IERC20Ext.sol";

interface IKyberSanity {
    function getSanityRate(IERC20Ext src, IERC20Ext dest) external view returns (uint256);
}
