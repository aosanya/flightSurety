# FlightSurety

FlightSurety is a Blockchain Nanodegree Project.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.
The dapp is a React-Redux app.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

### Airline Tests
`truffle test ./test/airlines.js`

### Flight Tests
`truffle test ./test/flights.js`

### Policies Tests
`truffle test ./test/flights.js`

### Oracle Tests
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)



#Installing Demo Contract

Run Test : truffle test test/policies.js
Take note of the contract address e.g.

    Contract: Flight Surety App Tests
    Contract Address is : 0x2eca6fcfef74e2c8d03fbaf0ff6712314c9bd58b
        Policy Purchase
        ✓ Buy Policy (1482ms)...

On the home page, click 'Load Existing Contract'. The test actions should then yield the same results in the dapp.
