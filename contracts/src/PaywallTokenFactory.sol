// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PaywallToken} from "./PaywallToken.sol";

contract PaywallTokenFactory {
    address private _curveAddress;

    mapping(address user => address[] nftAddress) private userContent;

    event ContentUploaded(address user, address nftAddress, string ipfsHash);

    constructor(address curveAddress) {
        _curveAddress = curveAddress;
    }

    function uploadContent(address user, string memory ipfsHash, uint128 spotPrice, uint128 delta) external {
        address nftAddress = _deployNFT(user, ipfsHash, spotPrice, delta);

        emit ContentUploaded(user, nftAddress, ipfsHash);
    }

    function getUserContent(address user) external view returns (address[] memory) {
        return userContent[user];
    }

    function _deployNFT(address contentOwner, string memory ipfsHash, uint128 spotPrice, uint128 delta)
        internal
        returns (address)
    {
        PaywallToken nft = new PaywallToken(address(this), contentOwner, ipfsHash, _curveAddress, spotPrice, delta);
        address nftAddress = address(nft);
        userContent[contentOwner].push(nftAddress);
        return nftAddress;
    }
}
