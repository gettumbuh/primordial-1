// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PH2O is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_386_000_000_000_000_000_000;

    constructor() ERC20('PH2O', 'PH2O') Ownable(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "PH2O: max supply exceeded"
        );
        _mint(to, amount);
    }
}
