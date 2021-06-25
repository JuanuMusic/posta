// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
interface IUBI is IERC20 {
    function mint(address dest, uint256 amount) external virtual;

    function burn(uint256 amount) external virtual;
    function burnFrom(address _account, uint256 _amount) external virtual;

    function startAccruing(address _human) external virtual;


}