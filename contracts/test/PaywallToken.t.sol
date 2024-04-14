// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";

import {PaywallTokenFactory} from "../src/PaywallTokenFactory.sol";
import {LinearCurve} from "../src/LinearCurve.sol";
import {ICurve} from "../src/ICurve.sol";
import {PaywallToken} from "../src/PaywallToken.sol";

contract PaywallTokenTest is Test {
    ICurve curve;
    PaywallTokenFactory factory;
    PaywallToken nft;

    address user = address(0x123);
    string ipfsHash = "ipfsHash";
    uint128 spotPrice = 100;
    uint128 delta = 10;

    function setUp() public {
        curve = new LinearCurve();
        factory = new PaywallTokenFactory(address(curve));

        nft = PaywallToken(payable(factory.uploadContent(user, ipfsHash, spotPrice, delta)));
    }

    function testFails_mint_InsufficientFunds() public {
        nft.safeMint(user);
    }

    function test_mintWorks() public {
        (,,, uint256 inputValue,,) = curve.getBuyInfo(spotPrice, delta, 1, 0, 0);
        nft.safeMint{value: inputValue}(user);

        assertEq(nft.ownerOf(0), user);
        assertEq(nft.balanceOf(user), 1);

        assertEq(address(nft).balance, inputValue);
    }

    function test_mintMultipleWorks() public {
        uint256 value;
        uint256 totalBalance;

        (,,, value,,) = curve.getBuyInfo(spotPrice, delta, 1, 0, 0);
        nft.safeMint{value: value}(user);
        totalBalance += value;

        (,,, value,,) = curve.getBuyInfo(spotPrice, delta, 2, 0, 0);
        nft.safeMint{value: value}(user);
        totalBalance += value;

        (,,, value,,) = curve.getBuyInfo(spotPrice, delta, 3, 0, 0);
        nft.safeMint{value: value}(user);
        totalBalance += value;

        assertEq(nft.ownerOf(0), user);
        assertEq(nft.ownerOf(1), user);
        assertEq(nft.ownerOf(2), user);
        assertEq(nft.balanceOf(user), 3);

        assertEq(address(nft).balance, totalBalance);
    }

    function test_buyPriceWorks() public {
        (,,, uint256 inputValue,,) = curve.getBuyInfo(spotPrice, delta, 1, 0, 0);
        assertEq(nft.getNextBuyPrice(), inputValue);

        nft.safeMint{value: inputValue}(user);
        assertEq(nft.ownerOf(0), user);
        assertEq(nft.balanceOf(user), 1);
    }
}
