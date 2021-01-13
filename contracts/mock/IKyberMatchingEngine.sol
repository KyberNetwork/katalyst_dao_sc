pragma solidity 0.6.6;

import "./IKyberReserve.sol";
import "./IKyberNetwork.sol";
import "./IKyberStorage.sol";


interface IKyberMatchingEngine {
    enum ProcessWithRate {NotRequired, Required}

    function setNegligibleRateDiffBps(uint256 _negligibleRateDiffBps) external;

    function setKyberStorage(IKyberStorage _kyberStorage) external;

    function getNegligibleRateDiffBps() external view returns (uint256);

    function getTradingReserves(
        IERC20Ext src,
        IERC20Ext dest,
        bool isTokenToToken,
        bytes calldata hint
    )
        external
        view
        returns (
            bytes32[] memory reserveIds,
            uint256[] memory splitValuesBps,
            ProcessWithRate processWithRate
        );

    function doMatch(
        IERC20Ext src,
        IERC20Ext dest,
        uint256[] calldata srcAmounts,
        uint256[] calldata feesAccountedDestBps,
        uint256[] calldata rates
    ) external view returns (uint256[] memory reserveIndexes);
}
