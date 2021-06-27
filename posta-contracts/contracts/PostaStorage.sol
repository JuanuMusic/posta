// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract PostaStorage {
    struct PostaData {
        
        // Ammount given as support
        uint256 supportGiven;
        
        // Total number of unique humans that support this post
        uint256 supportersCount;
    }

    address internal _ubi;
    uint256 internal _maxChars;

    // Mapping for NFTS
    mapping (uint256 => PostaData) internal _posts;

    // Mapping for humans that support each post
    mapping(uint256 => mapping(address => bool)) internal _supporters;

    address internal _poh;
    // Base URI
    string internal _baseURIextended;

    uint256 internal _tokenCounter;
}