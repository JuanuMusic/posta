// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../v1/PostaStorage.sol";

contract PostaStorageV2 is PostaStorage {

    // Burn Percentage
    uint256 internal _burnPct;

    // Treasury PCT
    uint256 internal _treasuryPct;
}