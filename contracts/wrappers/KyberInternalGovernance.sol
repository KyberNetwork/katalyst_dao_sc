pragma solidity 0.6.6;


import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@kyber.network/utils-sc/contracts/PermissionGroups.sol";
import "@kyber.network/utils-sc/contracts/Utils.sol";
import "../IKyberDao.sol";
import "../IKyberFeeHandler.sol";

interface IFeeHandler is IKyberFeeHandler {
    function hasClaimedReward(address, uint256) external view returns (bool);
}

/**
    Internal contracts to participate in KyberDAO and claim rewards for Kyber
*/
contract KyberInternalGovernance is ReentrancyGuard, PermissionGroups, Utils {
    using SafeERC20 for IERC20Ext;

    address payable public rewardRecipient;
    IKyberDao public kyberDao;
    IFeeHandler public kyberFeeHandler;

    event ClaimedRewards(uint256[] indexed epochs, uint256 totalReward, uint256 totalSentEth);

    constructor(
        address _admin,
        address payable _rewardRecipient,
        IKyberDao _dao,
        IFeeHandler _feeHandler,
        address _operator
    ) public PermissionGroups(_admin) {
        require(_rewardRecipient != address(0), "invalid reward recipient");
        require(_dao != IKyberDao(0), "invalid kyber dao");
        require(_feeHandler != IKyberFeeHandler(0), "invalid kyber fee handler");
        rewardRecipient = _rewardRecipient;
        kyberDao = _dao;
        kyberFeeHandler = _feeHandler;

        if (_operator != address(0)) {
            // consistent with current design
            operators[_operator] = true;
            operatorsGroup.push(_operator);
            emit OperatorAdded(_operator, true);
        }
    }

    receive() external payable {}

    /**
    * @dev only operator can vote, given list of campaign ids
    *   and an option for each campaign
    */
    function vote(
        uint256[] calldata campaignIds,
        uint256[] calldata options
    )
        external onlyOperator
    {
        require(campaignIds.length == options.length, "invalid length");
        for(uint256 i = 0; i < campaignIds.length; i++) {
            kyberDao.vote(campaignIds[i], options[i]);
        }
    }

    /**
    * @dev anyone can call to claim rewards for multiple epochs
    * @dev all eth will be sent back to rewardRecipient
    */
    function claimRewards(
        uint256[] calldata epochs
    )
        external nonReentrant
        returns (uint256 totalReward)
    {
        for(uint256 i = 0; i < epochs.length; i++) {
            if (!kyberFeeHandler.hasClaimedReward(address(this), epochs[i])) {
                try kyberFeeHandler.claimStakerReward(address(this), epochs[i])
                    returns(uint amount)
                {
                    totalReward += amount;
                } catch { }
            }
        }
        // transfer all eth to rewardRecipient
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            (bool success, ) = rewardRecipient.call{ value: ethBalance }("");
            require(success, "transfer eth to reward recipient failed");
        }
        emit ClaimedRewards(epochs, totalReward, ethBalance);
    }

    function updateRewardRecipient(address payable _newRecipient)
        external onlyAdmin
    {
        require(_newRecipient != address(0), "invalid address");
        rewardRecipient = _newRecipient;
    }

    /**
    * @dev most likely unused, but put here for flexibility or in case a mistake in deployment 
    */
    function updateKyberContracts(
        IKyberDao _dao,
        IFeeHandler _feeHandler
    )
        external onlyAdmin
    {
        require(_dao != IKyberDao(0), "invalid kyber dao");
        require(_feeHandler != IFeeHandler(0), "invalid kyber fee handler");
        kyberDao = _dao;
        kyberFeeHandler = _feeHandler;
    }

    /**
    * @dev allow withdraw funds of any tokens to rewardRecipient address
    */
    function withdrawFund(
        IERC20Ext[] calldata tokens,
        uint256[] calldata amounts
    ) external {
        require(tokens.length == amounts.length, "invalid length");
        for(uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == ETH_TOKEN_ADDRESS) {
                (bool success, ) = rewardRecipient.call { value: amounts[i] }("");
                require(success, "transfer eth failed");
            } else {
                tokens[i].safeTransfer(rewardRecipient, amounts[i]);
            }
        }
    }

    function updateOperators(address[] calldata operators, bool isAdd) external onlyAdmin {
        for(uint256 i = 0; i < operators.length; i++) {
            if (isAdd) {
                addOperator(operators[i]);
            } else {
                removeOperator(operators[i]);
            }
        }
    }
}
