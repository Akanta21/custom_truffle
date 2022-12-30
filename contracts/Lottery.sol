// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    modifier nonManager() {
        require(msg.sender != manager);
        _;
    }

    modifier sufficientPlayer() {
     if (players.length > 2) {
         _;
      }
    }

    function getPlayersLength() public view returns(uint) {
        return players.length;
    }

    function getPlayers() public view returns(address[] memory) {
        return players;
    }

    function enterLottery() public nonManager payable {
        require(msg.value > .01 ether);

        players.push(msg.sender);
    }

    function randomNumber() private view returns(uint) {
       return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public restricted payable{
        // if(players.length < 2) revert();

        uint index = randomNumber() % players.length;

        payable(players[index]).transfer(address(this).balance);

        players = new address[](0);
    }
}