// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface IUBI is IERC20 {
    function mint(address dest, uint256 amount) external;

    function burn(uint256 amount) external;
    function burnFrom(address _account, uint256 _amount) external;

    function startAccruing(address _human) external;


}