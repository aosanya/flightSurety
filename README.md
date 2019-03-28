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

## Create a test contract
Run the Policies Test :
    truffle test test/policies.js

Take note of the contract address e.g.
    Contract: Flight Surety App Tests
    FlightSuretyApp Address is : 0x52a2f2ea2f8d07d9fa0d9d73f1b9377fbab8fdbd
        Policy Purchase
        ✓ Buy Policy (1482ms)...

On the home page, click 'Load Existing Contract'.
Complete the form by entering
    App Contract Address
    Click Load Contracts
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/LoadContract.png?raw=true "Load Contract")
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/LoadedContract.png)

This will load the contract and avail more menu options.

# Demo Test Data

## Airlines
### Register Airline
    Airline Address : Use address 5 ; 0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2
    Metamask should be one of registered airlines : Account 1 to 4
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/RegisterAirline.png)

### Fund
    Enter Contribution(minimum is 10 Ether)
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/Contribute.png)

### Airlines Summary
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/AirlinesSummary.png)

### Airline Summary
    Airline Address : Use addresse 1 -> 4 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/AirlineSummary.png)
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/AirlineSummaryResult.png)

#Flights
### Register Flight
    Airline Address : Use addresse 1 -> 4 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flight Number : A1 10001 or any random Code
    Flight Date and Time : Any date defaulted to
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/RegisterFlight.png)

### Flight Summary
    Airline Address : Use addresse 1 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flight Number : AA001
    Flight Date and Time : 2019-02-01
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/FlightSummary.png)
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/FlightSummaryResult.png)

### Request Flight Status
    Airline Address : Use addresse 1 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flight Number : AA001
    Flight Date and Time : 2019-02-01
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/RequestFlightStatus.png)
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/RequestFlightStatusResult.png)

### Credit Insurees
    Airline Address : Use addresse 1 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flight Number : AA001
    Flight Date and Time : 2019-02-01
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/CreditInsurance.png)

## Passenger

### Buy Insurance
    Change Metamask Address to Address 6
    Airline Address : Use addresse 1 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flight Number : AA001
    Flight Date and Time : 2019-02-01
    Ticket Number : AA0010011 or any random code
    Premium : Any amooun greater than 0
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/BuyInsurance.png)

### Withdraw Pay
    Change Metamask Address to Address 6
    Airline Address : Use addresse 1 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flight Number : AA001
    Flight Date and Time : 2019-02-01
    Ticket Number : AA0010011 or the code used to buy insurance
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/WithdrawPay.png)

### Policy Summary
    Change Metamask Address to Address 6
    Airline Address : Use addresse 1 ; 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flight Number : AA001
    Flight Date and Time : 2019-02-01
    Ticket Number : AA001001 or the code used to buy insurance
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/PolicySummary.png)
    ![alt text](https://github.com/aosanya/flightSurety/blob/master/Screenshots/PolicySummaryResults.png)








