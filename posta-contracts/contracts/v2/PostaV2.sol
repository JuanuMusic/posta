// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../IProofOfHumanity.sol";
import "./PostaStorageV2.sol";
import "../PostaLib.sol";

interface IERC20Burnable {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

contract PostaV2 is OwnableUpgradeable, ERC721Upgradeable, PostaStorageV2 {

    event NewPost(address indexed author, uint256 indexed tokenId, string value);

    string constant HUMAN_NOT_REGISTERED = "HUMAN_NOT_REGISTERED";
    string constant POST_TEXT_TOO_LONG = "POST_TEXT_TOO_LONG";
    string constant CANT_SUPPORT_SELF_CONTENT = "CANT_SUPPORT_SELF_CONTENT";

    /// Require that an address is a valid registered human.
    modifier isHuman(address _submission) {
        require(IProofOfHumanity(_poh).isRegistered(_submission), HUMAN_NOT_REGISTERED);
        _;
    }

    /// Require that a token has been minted
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        _;
    }

    function publishPost(string memory text) public isHuman(_msgSender()) returns(uint256)  {
        require(bytes(text).length <= _maxChars, POST_TEXT_TOO_LONG);

        // Get the new token iD  
        uint256 newItemId = _tokenCounter;

        // Mint the NFT with the new ID
        _safeMint(_msgSender(), newItemId);

        // Generate the post NFT storage data
        PostaLib.PostaData memory post = PostaLib.PostaData({
            supportGiven: 0,
            supportersCount: 0
        });

        // Set the post dat to the token
        _setPost(newItemId, post);
        
        // Update the token counter
        _tokenCounter = _tokenCounter +1;

        emit NewPost(_msgSender(), newItemId, text);

        // Return the new token ID
        return newItemId;
    }

     function setBaseURI(string memory baseURI_) external onlyOwner() {
        baseURI = baseURI_;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function _setPost(uint256 tokenId, PostaLib.PostaData memory data) internal virtual tokenExists(tokenId) {
     _posts[tokenId] = data;
    }

    /// @dev Set the max length allowed for posts.
    function setMaxChars(uint256 maxChars) public onlyOwner() {
        _maxChars = maxChars;
    }

    function getMaxChars() public view returns(uint256) {
        return _maxChars;
    }

    function getTokenCounter() public view returns(uint256) {
        return _tokenCounter;
    }

    function getPost(uint256 tokenId) public view virtual tokenExists(tokenId) returns (PostaLib.PostaData memory) {
        return _posts[tokenId];
    }

    /**
     * Gives support to this posta and burns the UBI. 
     * Supporters count is only added once per human.
     * If a Human gives support multiple times it will only count as one supporter.
     */
    function support(uint256 tokenId, uint256 ubiAmount) public tokenExists(tokenId) {
        require(_msgSender() != ownerOf(tokenId), CANT_SUPPORT_SELF_CONTENT);

        // Calculate amount to burn        
        uint256 toBurn = PostaLib.getAmountToBurn(ubiAmount, _burnPct);

        // Burn the UBI on behalf of the caller.
        IERC20Burnable(_ubi).burnFrom(_msgSender(), toBurn);
        
        // Transfer remainder to posta creator
        uint256 forCreator = ubiAmount - toBurn;
        if(forCreator > 0) { 
            IERC20(_ubi).transferFrom(_msgSender(), ownerOf(tokenId), forCreator);
        }

        // Add support based on ubi amount
        _addSupport(tokenId, ubiAmount, _msgSender());
        
    }

    function _addSupport(uint256 tokenId, uint256 amount, address supporter) private {
        
         // Add the amount of support given
        _posts[tokenId].supportGiven += amount;

        // If is first support, add 1 supporter.
        if(!_supporters[tokenId][supporter]) {
            _supporters[tokenId][supporter] = true;
            _posts[tokenId].supportersCount += 1;
        }
    }

    /** Get percentage value of UBI to burn for each support given */
    function getBurnPct() public view returns (uint256){
        return _burnPct;
    }

    /** Set the percentage value of UBI to burn for each support given */
    function setBurnPct(uint256 burnPct) public onlyOwner {
        _burnPct = burnPct;
    }

    /** Get percentage value of UBI to send to treasury for each support given */
    function getTreasuryPct() public view returns (uint256) {
        return _burnPct;
    }

    /** Set the percentage value of UBI to send to treasury for each support given */
    function setTreasuryPct(uint256 treasuryPct) public onlyOwner {
        _treasuryPct = treasuryPct;
    }

    function getPOH() public view returns(address) {
        return _poh;
    }

    function setPOH(address poh) public onlyOwner {
        _poh = poh;
    }   

    function getUBI() public view returns(address) {
        return _ubi;
    }

    function setUBI(address ubi) public onlyOwner {
        _ubi = ubi;
    }
}