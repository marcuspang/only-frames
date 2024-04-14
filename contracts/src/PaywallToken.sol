// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {ICurve} from "./ICurve.sol";

contract PaywallToken is ERC721, Ownable {
    uint256 private _nextTokenId;
    address public _contentOwner;
    uint128 public _delta;
    uint128 public _spotPrice;
    string public _ipfsHash;
    ICurve public _curve;

    error InvalidPrice();
    error InsufficientFunds();
    error InvalidAddress();

    constructor(
        address initialOwner,
        address contentOwner,
        string memory ipfsHash,
        address curveAddress,
        uint128 spotPrice,
        uint128 delta
    ) ERC721("PaywallAccess", "PAY") Ownable(initialOwner) {
        if (initialOwner == address(0) || contentOwner == address(0) || curveAddress == address(0)) {
            revert InvalidAddress();
        }
        if (spotPrice == 0) {
            revert InvalidPrice();
        }
        _contentOwner = contentOwner;
        _ipfsHash = ipfsHash;
        _curve = ICurve(curveAddress);
        _delta = delta;
        _spotPrice = spotPrice;
    }

    fallback() external payable {}

    receive() external payable {}

    function safeMint(address to) public payable {
        uint256 price = getBuyPrice(_nextTokenId + 1);
        if (msg.value < price) {
            revert InsufficientFunds();
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function retrieveFunds(uint256 amount) public {
        if (msg.sender != _contentOwner || msg.sender != owner()) {
            revert InvalidAddress();
        }
        if (amount > address(this).balance) {
            revert InsufficientFunds();
        }
        payable(msg.sender).transfer(amount);
    }

    function getBuyPrice(uint256 numItems) public view returns (uint256) {
        // TODO: add protocol fees
        (,,, uint256 inputValue,,) = _curve.getBuyInfo(_spotPrice, _delta, numItems, 0, 0);
        return inputValue;
    }
}
