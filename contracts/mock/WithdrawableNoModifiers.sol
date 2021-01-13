pragma solidity 0.6.6;

import "@kyber.network/utils-sc/contracts/IERC20Ext.sol";
import "./PermissionGroupsNoModifiers.sol";


contract WithdrawableNoModifiers is PermissionGroupsNoModifiers {
    constructor(address _admin) public PermissionGroupsNoModifiers(_admin) {}

    event EtherWithdraw(uint256 amount, address sendTo);
    event TokenWithdraw(IERC20Ext token, uint256 amount, address sendTo);

    /// @dev Withdraw Ethers
    function withdrawEther(uint256 amount, address payable sendTo) external {
        onlyAdmin();
        (bool success, ) = sendTo.call{value: amount}("");
        require(success);
        emit EtherWithdraw(amount, sendTo);
    }

    /// @dev Withdraw all IERC20Ext compatible tokens
    /// @param token IERC20Ext The address of the token contract
    function withdrawToken(
        IERC20Ext token,
        uint256 amount,
        address sendTo
    ) external {
        onlyAdmin();
        token.transfer(sendTo, amount);
        emit TokenWithdraw(token, amount, sendTo);
    }
}
