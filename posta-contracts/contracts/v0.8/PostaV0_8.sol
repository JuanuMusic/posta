// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
//import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../IProofOfHumanity.sol";
import "../v0.8/PostaStorageV_2.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
//import "hardhat/console.sol";

interface IERC20Burnable is IERC20 {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

contract PostaV0_8 is Initializable, OwnableUpgradeable, ERC721Upgradeable, PostaStorageV_2 {

    using ECDSA for bytes32;
    // Event emited when a user creates a new post. This is emited also when a reply is created.
    event NewPost(address indexed author, uint256 indexed tokenId, string value);

    // Event emited when a user replies to a post. This is emited after NewPost since a reply is also a new post.
    /// @param tokenId ID of the new token generated.
    /// @param replyOfTokenId ID of the existing token being replied to.
    event NewPostReply(uint256 indexed tokenId, uint256 indexed replyOfTokenId);

    // Event emites when a user gives support to a post.
    event SupportGiven(uint256 indexed tokenId, address indexed supporter, uint256 amount, uint256 burnt, uint256 treasury);

    // Event emits when a user creates a post on behalf of another user.
    event NewPostOnBehalfOf(uint256 indexed tokenId, address indexed postedBy);

    string constant HUMAN_NOT_REGISTERED = "HUMAN_NOT_REGISTERED";
    string constant POST_TEXT_TOO_LONG = "POST_TEXT_TOO_LONG";
    string constant CANT_SUPPORT_SELF_CONTENT = "CANT_SUPPORT_SELF_CONTENT";
    string constant BURN_TREASURY_MUST_TOTAL_ONE = "BURN_TREASURY_MUST_TOTAL_ONE";
    string constant POSTA_INVALID_SIGNATURE = "POSTA_INVALID_SIGNATURE";
    string constant POSTA_SIGNER_CANNOT_BE_POSTER = "POSTA_SIGNER_CANNOT_BE_POSTER";

    function initialize(address poh, address ubi, uint256 maxChars, uint256 burnPct, uint256 treasuryPct) public virtual initializer {
        __ERC721_init("Posta","POSTA");
        OwnableUpgradeable.__Ownable_init();
        _tokenCounter = 0;
        _poh = poh;
        _ubi = ubi;
        _maxChars = maxChars;
        _burnPct = burnPct;
        _treasuryPct = treasuryPct;
    }

    /// Require that an address is a valid registered human.
    modifier isHuman(address _submission) {
        require(isAddressHuman(_submission), HUMAN_NOT_REGISTERED);
        _;
    }

    /// Require that a token has been minted
    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        _;
    }

    function isAddressHuman(address _submission) public view returns(bool) {
        return IProofOfHumanity(_poh).isRegistered(_submission);
    }

    function publishPost(string memory text, uint256 isReplyOfTokenId) public isHuman(_msgSender()) returns(uint256)  {
        return _publishPost(text, _msgSender(), isReplyOfTokenId);
    }

    function publishOnBehalfOf(string memory text, address author, uint256 isReplyOfTokenId, uint256 nonce, bytes memory signature) public isHuman(_msgSender()) returns(uint256) {
        require(isAddressHuman(author), HUMAN_NOT_REGISTERED);
        require(author != _msgSender(), POSTA_SIGNER_CANNOT_BE_POSTER);
        // This recreates the message hash that was signed on the client.
        bytes memory encoded = abi.encode(author, isReplyOfTokenId, nonce, text);
        bytes32 payloadHash = keccak256(encoded);
        bytes32 messageHash = payloadHash.toEthSignedMessageHash();

        // Verify that the message's signer is the author of the post
        address signer = messageHash.recover(signature);
        require(signer == author, POSTA_INVALID_SIGNATURE);

        require(!_seenNonces[signer][nonce]);
        _seenNonces[signer][nonce] = true;

        uint256 newPostTokenId = _publishPost(text, author, isReplyOfTokenId);
        emit NewPostOnBehalfOf(newPostTokenId, _msgSender());
    }

    function _publishPost(string memory text, address author, uint256 isReplyOfTokenId) private isHuman(_msgSender()) returns(uint256)  {
        require(bytes(text).length <= _maxChars, POST_TEXT_TOO_LONG);
        
        // If it's a reply, require that exists.
        if(isReplyOfTokenId > 0) {
            require(_exists(isReplyOfTokenId), "POSTA: Requesting reply of nonexistent posta");
        }

        // Update the token counter
        _tokenCounter += 1;

        // Get the new token iD  
        uint256 newItemId = _tokenCounter;

        
        // Mint the NFT with the new ID
        _safeMint(author, newItemId);
        

        // Generate the post NFT storage data
        PostaData memory post = PostaData({
            supportGiven: 0,
            supportersCount: 0
        });

        // Set the post dat to the token
        _setPost(newItemId, post);

        emit NewPost(author, newItemId, text);

        if(isReplyOfTokenId > 0) {
            emit NewPostReply(newItemId, isReplyOfTokenId);
        }


        // Return the new token ID
        return newItemId;
    }


    function _processSupport(uint256 ubiAmount) private returns (uint256 toBurn, uint256 forTreasury, uint256 forCreator) {
        // Calculate amount to burn        
        toBurn = _getAmountFromPct(ubiAmount, _burnPct);

        // Calculate amount for treasry        
        forTreasury = _getAmountFromPct(ubiAmount, _treasuryPct);

        // Transfer remainder to posta creator
        forCreator = ubiAmount - toBurn - forTreasury;       
    }

    /**
     * Gives support to this posta and burns the UBI. 
     * Supporters count is only added once per human.
     * If a Human gives support multiple times it will only count as one supporter.
     */
    function support(uint256 tokenId, uint256 ubiAmount) public tokenExists(tokenId) {
        require(_msgSender() != ownerOf(tokenId), CANT_SUPPORT_SELF_CONTENT);
        // Process support calcs
        (uint256 toBurn, uint256 forTreasury, uint256 forCreator) = _processSupport(ubiAmount);

        IERC20Burnable ubiErc20 = IERC20Burnable(_ubi);
        // Burn the UBI on behalf of the caller.
        if(toBurn > 0) ubiErc20.burnFrom(_msgSender(), toBurn);

        // Send to treasury
        if(forTreasury >0) ubiErc20.transferFrom(_msgSender(), address(this),forTreasury);

        // Transfer remaining to creator
        if(forCreator > 0) IERC20(_ubi).transferFrom(_msgSender(), ownerOf(tokenId), forCreator);

        _addSupport(tokenId, ubiAmount, _msgSender());

        // Emit support given event
        emit SupportGiven(tokenId, _msgSender(), ubiAmount, toBurn, forTreasury);
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

    function _getAmountFromPct(uint256 totalAmount, uint256 percentage) public pure returns (uint256 calculatedValue) {
        if(percentage > 0) {
            // ammount to burn
            calculatedValue = totalAmount/(1*(10**18) / percentage);
        }
    }     

     function setBaseURI(string memory baseURI_) external onlyOwner() {
        baseURI = baseURI_;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
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

    function getTokenCounter() public view returns(uint256) {
        return _tokenCounter;
    }

    function getPost(uint256 tokenId) public view virtual tokenExists(tokenId) returns (PostaData memory) {
        return _posts[tokenId];
    }

        

    /** Get percentage value of UBI to burn for each support given */
    function getBurnPct() public view returns (uint256){
        return _burnPct;
    }

    /** Set the percentage value of UBI to burn for each support given */
    function setBurnPct(uint256 burnPct) public onlyOwner {
        require(burnPct + _treasuryPct <= 1*(10**18), BURN_TREASURY_MUST_TOTAL_ONE);
        _burnPct = burnPct;
    }

    /** Get percentage value of UBI to send to treasury for each support given */
    function getTreasuryPct() public view returns (uint256) {
        return _treasuryPct;
    }

    /** Set the percentage value of UBI to send to treasury for each support given */
    function setTreasuryPct(uint256 treasuryPct) public onlyOwner {
        require(_burnPct + treasuryPct <= 1*(10**18), BURN_TREASURY_MUST_TOTAL_ONE);
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