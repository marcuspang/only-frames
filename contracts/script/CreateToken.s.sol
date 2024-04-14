// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {LinearCurve} from "../src/LinearCurve.sol";
import {CurveErrorCodes} from "../src/CurveErrorCodes.sol";
import {PaywallTokenFactory} from "../src/PaywallTokenFactory.sol";

contract CreateTokenScript is Script {
    LinearCurve public curve;
    PaywallTokenFactory public factory;

    function setUp() public {
        curve = LinearCurve(0x3120A9D18C74c28dd6a42425B07b8decb04E9952);
        // curve = new LinearCurve();
        factory = PaywallTokenFactory(0xeD979fC9548dee08cE4a0A1FA8910846CCAAB416);
        // factory = new PaywallTokenFactory(address(curve));
    }

    function run() public {
        vm.startBroadcast();

        console.log("LinearCurve address", address(curve));
        console.log("PaywallTokenFactory address", address(factory));

        address nftAddress = factory.uploadContent(0x8A322f00b1097D343C824ff1BBcB2A78Be50C2D7, "QmYa3jGh5oj97ujPCGz86wR99aBh7skVtUsduwT9A6D7jH", 1, 0);

        console.log("NFT address", nftAddress);

        vm.stopBroadcast();
    }
}
