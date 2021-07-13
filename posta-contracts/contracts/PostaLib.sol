// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

library PostaLib {

    struct PostaData {
        
        // Ammount given as support
        uint256 supportGiven;
        
        // Total number of unique humans that support this post
        uint256 supportersCount;
    }

    function getAmountToBurn(uint256 totalAmount, uint256 burnPct) public pure returns (uint256) {
        uint256 toBurn = 0;
        if(burnPct > 0) {
            // ammount to burn
            toBurn = totalAmount/(1*(10**18) / burnPct);
            require(toBurn > 0, "Posta: invalid ubi amount to burn");
        }
        return toBurn;
    }        
}