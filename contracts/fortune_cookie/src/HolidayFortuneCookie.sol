// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * Holiday Fortune Cookie ERC721
 */
contract HolidayFortuneCookie is ERC721 {
    using Strings for uint256;

    event FortuneMinted(address indexed minter, uint256 indexed tokenId, string fortuneText);

    // Mint price: 0.0001 ETH
    uint256 public constant MINT_PRICE = 0.0001 ether;

    // Address receiving creator fees (replace before deployment if desired).
    address public immutable creator;

    // Tracks total minted supply.
    uint256 public tokenSupply;

    // Stores the onchain fortune per token id.
    mapping(uint256 => string) private _fortuneById;

    constructor(address _creator) ERC721("Holiday Fortune Cookie", "COOKIE") {
        require(_creator != address(0), "Invalid creator");
        creator = _creator;
    }

    /**
     * Mint a new fortune cookie NFT with a holiday crypto pun.
     */
    function mint(string calldata fortuneText) external payable returns (uint256 tokenId) {
        require(msg.value >= MINT_PRICE, "Mint price not met");
        require(bytes(fortuneText).length > 0, "Fortune required");

        tokenId = ++tokenSupply;
        _safeMint(msg.sender, tokenId);
        _fortuneById[tokenId] = fortuneText;

        emit FortuneMinted(msg.sender, tokenId, fortuneText);

        // Forward the creator tip.
        (bool sent, ) = creator.call{value: msg.value}("");
        require(sent, "Tip transfer failed");
    }

    /// Next token id to be minted (supply + 1).
    function getNextTokenId() external view returns (uint256) {
        return tokenSupply + 1;
    }

    /// Override tokenURI to return lightweight JSON metadata.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: invalid token");

        string memory fortuneText = _fortuneById[tokenId];
        string memory image = "https://iili.io/fxAC2Ll.md.png";
        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name":"Holiday Fortune Cookie #',
                    tokenId.toString(),
                    '","description":"',
                    fortuneText,
                    '","image":"',
                    image,
                    '","attributes":[{"trait_type":"Fortune","value":"',
                    fortuneText,
                    '"}]}'
                )
            )
        );

        return string.concat("data:application/json;base64,", json);
    }

    /// Reads the stored fortune for a token id.
    function fortuneOf(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: invalid token");
        return _fortuneById[tokenId];
    }
}
