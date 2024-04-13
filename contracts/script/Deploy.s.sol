// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {LinearCurve} from "../src/LinearCurve.sol";
import {CurveErrorCodes} from "../src/CurveErrorCodes.sol";
import {PaywallTokenFactory} from "../src/PaywallTokenFactory.sol";

contract CounterScript is Script {
    LinearCurve public curve;
    PaywallTokenFactory public factory;

    function setUp() public {
        // sepolia: 0x3120A9D18C74c28dd6a42425B07b8decb04E9952
        // mainnet: 0xD5869048daaf4C052Aa37ABA2a38888437358f84
        curve = new LinearCurve();
        // sepolia: 0x85e9C8457b01D3Eae92796279044474C4E70416c
        // mainnet: 0xbbcF517F3d58189E9FF4acCDE435fAD61595eF45
        factory = new PaywallTokenFactory(address(curve));
    }

    function run() public {
        vm.broadcast();

        console.log("LinearCurve address", address(curve));
        console.log("PaywallTokenFactory address", address(factory));

        // address nftAddress = factory.uploadContent(0x8A322f00b1097D343C824ff1BBcB2A78Be50C2D7, "QmYa3jGh5oj97ujPCGz86wR99aBh7skVtUsduwT9A6D7jH", 0, 0);

        // console.log("NFT address", nftAddress);
    }
}
