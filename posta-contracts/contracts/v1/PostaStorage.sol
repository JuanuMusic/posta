// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../PostaLib.sol";

contract PostaStorage {

    address internal _ubi;
    uint256 internal _maxChars;

    // Mapping for NFTS
    mapping (uint256 => PostaLib.PostaData) internal _posts;

    // Mapping for humans that support each post
    mapping(uint256 => mapping(address => bool)) internal _supporters;

    address internal _poh;

    uint256 internal _tokenCounter;

    // Base URI
    string internal baseURI;
}