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
        curve = new LinearCurve();
        factory = new PaywallTokenFactory(address(curve));
    }

    function run() public {
        vm.broadcast();

        console.log("LinearCurve address", address(curve));
        console.log("PaywallTokenFactory address", address(factory));
    }
}
