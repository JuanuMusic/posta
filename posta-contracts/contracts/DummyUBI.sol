// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IUBI.sol";

contract DummyUBI is ERC20, IUBI  {

    constructor() ERC20("Universal Basic Income", "UBI") {

    }

    function mint(address dest, uint256 amount) public override {
        _mint(dest, amount);
    }

    function burn(uint256 amount) public override {
        _burn(_msgSender(), amount);
    }

    function burnFrom(address _account, uint256 _amount) public override {
        _burn(_account, _amount);
    }

    function startAccruing(address _human) external override {    
        // TODO: implement basic logic of accruing dummy UBIs
    }

}