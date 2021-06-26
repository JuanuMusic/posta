// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IProofOfhumanity.sol";

contract Posta is ERC721, Ownable {
    
    using SafeMath for uint256;

    event NewPost(address indexed author, uint256 indexed tokenId, string value);

    string HUMAN_NOT_REGISTERED = "HUMAN_NOT_REGISTERED";
    string POST_TEXT_TOO_LONG = "POST_TEXT_TOO_LONG";
    string CANT_SUPPORT_SELF_CONTENT = "CANT_SUPPORT_SELF_CONTENT";

    using Strings for uint256;
    address private _ubi;
    uint256 private _maxChars;

    struct PostaData {
        
        // Ammount given as support
        uint256 supportGiven;
        
        // Total number of unique humans that support this post
        uint256 supportersCount;
    }
    
    // Mapping for NFTS
    mapping (uint256 => PostaData) private _posts;

    // Mapping for humans that support each post
    mapping(uint256 => mapping(address => bool)) _supporters;

    address private _poh;
    // Base URI
    string private _baseURIextended;

    uint256 private _tokenCounter;
    

    /// Require that an address is a valid registered human.
    modifier isHuman(address _submission) {
        IProofOfHumanity.SubmissionInfo memory info = IProofOfHumanity(_poh).getSubmissionInfo(_submission);
        require(info.registered, HUMAN_NOT_REGISTERED);
        _;
    }

    /// Require that a token has been minted
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        _;
    }

    constructor(address poh, address ubi, uint256 maxChars) public ERC721("Posta", "PSTA") {
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
        PostaData memory post = PostaData({
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
        _baseURIextended = baseURI_;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function _setPost(uint256 tokenId, PostaData memory data) internal virtual tokenExists(tokenId) {
     _posts[tokenId] = data;
    }

    /// @dev Set the max length allowed for posts.
    function setMaxChars(uint256 maxChars) public onlyOwner() {
        _maxChars = maxChars;
    }

    function getMaxChars() public view returns(uint256) {
        return _maxChars;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override tokenExists(tokenId) returns (string memory) {
        return "NOT IMPLEMENTED - FILTER LOGS BY EVENT NewPost(indexed author,indexed token,text) TO GET DATA";
        // PostaData memory post = _posts[tokenId];
        // string memory base = _baseURI();
        
        // // If there is no base URI, return the token URI.
        // if (bytes(base).length == 0) {
        //     return post.tokenURI;
        // }
        // // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        // if (bytes(post.tokenURI).length > 0) {
        //     return string(abi.encodePacked(base, post.tokenURI));
        // }
        // // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        // return string(abi.encodePacked(base, tokenId.toString()));
    }

    function getTokenCounter() public view returns(uint256) {
        return _tokenCounter;
    }

    function getPost(uint256 tokenId) public view virtual tokenExists(tokenId) returns (PostaData memory) {
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