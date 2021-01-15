pragma solidity 0.6.6;

import "@kyber.network/utils-sc/contracts/IERC20Ext.sol";


interface IGasHelper {
    function freeGas(
        address platformWallet,
        IERC20Ext src,
        IERC20Ext dest,
        uint256 tradeWei,
        bytes32[] calldata t2eReserveIds,
        bytes32[] calldata e2tReserveIds
    ) external;
}
