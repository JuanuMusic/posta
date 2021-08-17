// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

struct PostaData {
        
// Ammount given as support
uint256 supportGiven;

// Total number of unique humans that support this post
uint256 supportersCount;
}

contract PostaStorageV_2 {

    // Mapping for NFTS
    mapping (uint256 => PostaData) internal _posts;

    // Mapping for humans that support each post
    mapping(uint256 => mapping(address => bool)) internal _supporters;

    address internal _poh;
    address internal _ubi;
    address payable internal _treasury;

    uint256 internal _tokenCounter;
    uint256 internal _maxChars;
    
    // Burn Percentage
    uint256 internal _burnPct;

    // Treasury PCT
    uint256 internal _treasuryPct;

    // Base URI
    string internal baseURI;

    mapping(address => mapping(uint256 => bool)) internal _seenNonces;
}