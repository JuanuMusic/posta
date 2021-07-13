// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
//import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "../IProofOfHumanity.sol";
import "./PostaStorage.sol";
import "../PostaLib.sol";

contract Posta is Initializable, OwnableUpgradeable, ERC721Upgradeable, PostaStorage {
    
    using SafeMath for uint256;
    //using Strings for uint256;

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
    
    function initialize(address poh, address ubi, uint256 maxChars) public virtual initializer {
        __ERC721_init("Posta","POSTA");
        OwnableUpgradeable.__Ownable_init();
        _tokenCounter = 0;
        _poh = poh;
        _ubi = ubi;
        _maxChars = maxChars;
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
        // ammount to burn
        uint256 toBurn = ubiAmount.div(2);
        require(toBurn > 0, "Posta: invalid ubi amount to burn");
        
        // Burn the UBI on behalf of the caller.
        ERC20Burnable(_ubi).burnFrom(_msgSender(), toBurn);
        
        // Transfer remainder to posta creator
        uint256 forCreator = ubiAmount.sub(toBurn);
        if(forCreator > 0) { 
            ERC20(_ubi).transferFrom(_msgSender(), ownerOf(tokenId), forCreator);
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
}