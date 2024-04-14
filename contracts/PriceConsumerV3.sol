// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 is Ownable {

    // Create a struct that will hold the address of chainLink pricefeeds and the conversion pair we are intrested in 

    struct FeedInfo {
        AggregatorV3Interface aggregator;
        string description;
    }
    
    // Map integer to FeedInfo struct
    mapping(uint => FeedInfo) public feeds;

    // create a mapping from the price feed ID to the price returned fron Chainlink
    mapping(uint => int) public lastFetchedPrice;

    // events
    event FeedAddressesUpdated(uint feedId, address newAddress, string description);
    event Pricerequested(string description, int price);

    constructor() Ownable(msg.sender) {
        // Chainlink smart contract addresses for teh conversion pairs
        // Currently, this contract targets Ethereum Sepolia Testnet
        feeds[1] = FeedInfo(AggregatorV3Interface(0x31CF013A08c6Ac228C94551d535d5BAfE19c602a), "BTC/USD");
        feeds[2] = FeedInfo(AggregatorV3Interface(0x86d67c3D38D2bCeE722E601025C25a575021c6EA), "ETH/USD");
        feeds[3] = FeedInfo(AggregatorV3Interface(0x34C4c526902d88a3Aa98DB8a9b802603EB1E3470), "LINK/USD");
        feeds[4] = FeedInfo(AggregatorV3Interface(0x378E78509a907B1Ec5c24d9f0243BD39f7A7b007), "BTC/ETH");
    }

    // Retrieve the current price from ChainLink contract and then update the stored price
    function updatePrice(uint feedId) public {
        FeedInfo storage feed = feeds[feedId];
        require(address(feed.aggregator) != address(0), "Contract address not found.");
        (, int price,,,) = feed.aggregator.latestRoundData();

        //update lastfetchedPrice mapping 
        lastFetchedPrice[feedId] = price;
        // emit event
        emit Pricerequested(feed.description, price);
    }

    function getLastFetchedPrice(uint feedId) public view returns(int) {
        // require(lastFetchedPrice[feedId] != 0, "Latest price conversion has not been retrieved");
        return lastFetchedPrice[feedId];
    }

    function updateFeedAddress(uint feedId, address newAddress) public onlyOwner {
        // using a modifier so that only the contract owner can execute the function
        require(newAddress != address(0), "Updated address is undefined");
        // must be 1,2,3,4
        require(feedId > 0 && feedId < 5, "Invalid feed Id");
        feeds[feedId].aggregator = AggregatorV3Interface(newAddress);
        emit FeedAddressesUpdated(feedId, newAddress, feeds[feedId].description);
    }

}
