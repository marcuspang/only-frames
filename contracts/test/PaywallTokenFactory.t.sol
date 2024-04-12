// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";

import {PaywallTokenFactory} from "../src/PaywallTokenFactory.sol";
import {LinearCurve} from "../src/LinearCurve.sol";
import {ICurve} from "../src/ICurve.sol";
import {PaywallToken} from "../src/PaywallToken.sol";

contract PaywallFactoryTest is Test {
    ICurve curve;

    function setUp() public {
        curve = new LinearCurve();
    }

    function test_deploy() public {
        new PaywallTokenFactory(address(curve));
    }

    function test_deployNfts(address user, string memory ipfsHash, uint128 spotPrice, uint128 delta) public {
        vm.assume(spotPrice > 0);
        vm.assume(user != address(0));

        PaywallTokenFactory factory = new PaywallTokenFactory(address(curve));
        factory.uploadContent(user, ipfsHash, spotPrice, delta);
        address[] memory nfts = factory.getUserContent(user);

        assertEq(nfts.length, 1);

        PaywallToken nft = PaywallToken(payable(nfts[0]));
        assertEq(nft._contentOwner(), user);
        assertEq(nft._ipfsHash(), ipfsHash);
        assertEq(nft._spotPrice(), spotPrice);
        assertEq(nft._delta(), delta);
        assertEq(address(nft._curve()), address(curve));
    }

    function testFails_zeroAddress(string memory ipfsHash, uint128 spotPrice, uint128 delta) public {
        PaywallTokenFactory factory = new PaywallTokenFactory(address(curve));
        factory.uploadContent(address(0), ipfsHash, spotPrice, delta);
    }

    function testFails_zeroSpotPrice(string memory ipfsHash, address user, uint128 delta) public {
        vm.assume(user != address(0));
        PaywallTokenFactory factory = new PaywallTokenFactory(address(curve));
        factory.uploadContent(user, ipfsHash, 0, delta);
    }
}
