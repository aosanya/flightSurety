import Config from '../../../utils/config.json';
import DemoData from '../utils/DemoData.json';
import web3Utils from '../../../utils/web3Utils';
import FlightSuretyAppJson from '../../../build/contracts/FlightSuretyApp.json'

export default class ContractApp {
    constructor(callback) {

        //let config = Config[network];
        //this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        // this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        // this.initialize(callback);
        this.contract = null;
        this.contracts = {};
        this.web3Provider = null;
        this.web3 = null;
        this.metamaskAccountID = "0x0000000000000000000000000000000000000000";
        this.demoData = DemoData;
        this.initWeb3(callback);

        // this.owner = null;
        // this.airlines = [];
        // this.passengers = [];
    }

    async initWeb3(callback) {

        // Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            this.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            this.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            this.web3Provider = new Web3.providers.HttpProvider(Config.localhost.url);
            console.log('Loaded Ganache')
        }

        this.web3 = new Web3(this.web3Provider);
        await this.getMetaskAccountID(callback);
        await this.initContract(callback);
        await this.initializeDemo()
        callback(this)
    }

    async initContract(callback) {
        var contractArtifact = FlightSuretyAppJson;
        this.contracts.FlightSuretyApp = TruffleContract(contractArtifact);
        this.contracts.FlightSuretyApp.setProvider(this.web3Provider);
        await this.fetchEvents(null);
       }

    async initializeDemo() {
        this.demoData.flights.push({"airline" : DemoData.AirlineAddresses[0], "flightNumber" : "AA001", "time" : new Date(2019,0,1,8,0) / 1000, key : "0xcbaa35fdc6f4b18e88d9ed55d4934a2b7d6c9c1d9a348db3f6f133d3d9bf4c65"})
        this.demoData.flights.push({"airline" : DemoData.AirlineAddresses[0], "flightNumber" : "AA001", "time" : new Date(2019,1,1,8,0) / 1000, key : "0xa970d9a96a7d46b67f56443b0c7dd61951e3ba6ef521ed0a3d280d1250f3c3af"})
        this.demoData.flights.push({"airline" : DemoData.AirlineAddresses[1], "flightNumber" : "BB001", "time" : new Date(2019,2,1,8,0) / 1000, key : "0x8b7f1cdf1105030ea4d859fecfc125b42efb069a15df8cf1efffe168379259e4"})
        this.demoData.flights.push({"airline" : DemoData.AirlineAddresses[2], "flightNumber" : "CC001", "time" : new Date(2019,3,1,8,0) / 1000, key : "0x7bf71f9e08be7aef25e8c59356d6ce773eaf12ccfb1ccd1ec602da2ff32ef2e5"})
        this.demoData.flights.push({"airline" : DemoData.AirlineAddresses[3], "flightNumber" : "DD001", "time" : new Date(2019,4,1,8,0) / 1000, key : "0x530f9044bd37b1d7e3c467234a3f6476cec72b3b69ce400d4ca0df71f75bd309"})
        console.log(this.demoData)
    }

    async fetchEvents(callback) {

        if (this.contract == null){
            return
        }

        if (typeof this.contracts.FlightSuretyApp.currentProvider.sendAsync !== "function") {
            this.contracts.FlightSuretyApp.currentProvider.sendAsync = function () {
                return this.contracts.FlightSuretyApp.currentProvider.send.apply(
                this.contracts.FlightSuretyApp.currentProvider,
                    arguments
            );
            };
        }
        this.contracts.FlightSuretyApp.at(this.contract).then(function(instance) {

            var events = instance.allEvents(function(err, log){
            if (!err)
                console.log(log.event + ' - ' + log.transactionHash);
            });
            // if (callback != undefined){
            //     callback(this)
            // }
        }).catch(function(err) {
            console.log(err.message);
        });


    }

    async getMetaskAccountID(callback) {
        // Retrieving accounts

        console.log(this.web3.eth.accounts)
        this.web3.eth.getAccounts((err, res) => {
            console.log(res)
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            this.metamaskAccountID =  res[0];
            callback(this)
        })
    }

    async createNewContract(callback) {
        this.contracts.FlightSuretyApp.new().then(function(instance) {
            callback(instance)
        }).catch(function(err) {
            console.log(err.message);
            return null;
        });
    }

    async loadContract(contractAddress, callback) {
        this.contracts.FlightSuretyApp.at(contractAddress).then(function(instance) {
            callback(instance)
        }).catch(function(err) {
            console.log(err.message);
            return null;
        });
    }



    async registerAirline(contractAddress, callback, address) {
        console.log(contractAddress)
        console.log(address)
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)

        try{
            const callAction = await contractInstance.registerAirline(address);
            return callback({successful: true, tx : callAction, message : "Airline registered successfully"})
        }
        catch(error){
            return callback({successful: false, tx : null, message : error.toString()})
        }
    }

    async fund(contractAddress, callback, value) {
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)

        try{
            const callAction = await contractInstance.fund({value : value});
            return callback({successful: true, tx : callAction, message : "Airline contributed successfully"})
        }
        catch(error){
            return callback({successful: false, tx : null, message : error.toString()})
        }
    }

    async registerFlight(contractAddress, callback, address, flightNumber, dateTime) {
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)

        try{
            const callAction = await contractInstance.registerFlight(address, flightNumber, dateTime);
            return callback({successful: true, tx : callAction, message : "Flight registered successfully"})
        }
        catch(error){
            return callback({successful: false, tx : null, message : error.toString()})
        }
    }

    async buyPolicy(contractAddress, callback, address, flightNumber, dateTime, premium) {
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)

        try{
            const flightKey = await config.flightSuretyApp.getFlightKey(address, flightNumber, dateTime);
            const callAction = await contractInstance.buy(flightKey, flightNumber, {value : web3.toWei(premium,"ether")});
            return callback({successful: true, tx : callAction, message : "Flight registered successfully"})
        }
        catch(error){
            return callback({successful: false, tx : null, message : error.toString()})
        }
    }



    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
        });
    }



    async fetchAirlinesSummary(contractAddress, callback) {
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)
        try{
            let airlinesSummary = await contractInstance.fetchAirlinesSummary();
            callback({
                successful: true, message : 'Airlines summary fetched successful',
                summary : {
                    registered : {title : 'Registered', value : airlinesSummary[0].toNumber()},
                    registrationQueue : {title : 'Registration Queue', value :airlinesSummary[1].toNumber()},
                    quorum : {title : 'Quorum', value :airlinesSummary[2].toNumber()},
                    consensusPercentage : {title : 'Consensus Percentage', value :airlinesSummary[3].toNumber()},
                    consensus : {title : 'Consensus', value :airlinesSummary[4].toNumber()}
                }
            })
        }
        catch(error){
            return callback({successful: false, message : error.toString()})
        }
     }

     async fetchAirlineSummary(contractAddress, callback, airlineAddress) {
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)
        try{
            let summary = await contractInstance.fetchAirlineSummary(airlineAddress);
            callback({
                successful: true, message : 'Airline summary fetched successful',
                summary : {
                    votes : {title : 'Votes', value : summary[0].toNumber()},
                    isRegistered : {title : 'Is Registered', value : summary[1]},
                    contribution : {title : 'Contribution', value : this.web3.fromWei(summary[2].toNumber(), 'ether')}
                }
            })
        }
        catch(error){
            return callback({successful: false, message : error})
        }
     }

     async fetchFlightSummary(contractAddress, callback, address, flightNumber, dateTime) {
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)
        try{
            let flightKey = await contractInstance.getFlightKey(address, flightNumber, dateTime);

            console.log(flightKey)
            let summary = await contractInstance.fetchFlightSummary(flightKey);
            callback({
                successful: true, message : 'Flight summary fetched successful',
                summary : {
                    Id : {title : 'Id', value : summary[0]},
                    airline : {title : 'Airline', value : summary[1]},
                    flightNumber : {title : 'Flight Number', value : summary[2]},
                    date : {title : 'Date', value : new Date(1000 * summary[3]).toLocaleString()},
                    isRegistered : {title : 'Is Registered', value : summary[4]},
                    statusCode : {title : 'Status Code', value : summary[5]},
                    updatedTimestamp : {title : 'Last Update', value : summary[6]},
                    votes : {title : 'Registration Votes', value : summary[7].toNumber()},
                    canBeInsured : {title : 'Can Be Insured', value : summary[8]},
                    policyCount : {title : 'Policy Count', value : summary[9].toNumber()},
                    paidoutClaims : {title : 'Claims Paid Out', value : summary[10]}
                }
            })
        }
        catch(error){
            return callback({successful: false, message : error.toString()})
        }
     }


     async fetchPolicySummary(contractAddress, callback, address, ticketNumber, dateTime) {
         console.log(address)
         console.log(ticketNumber)
         console.log(dateTime)
        const contractInstance = await this.contracts.FlightSuretyApp.at(contractAddress)
        try{
            const flightKey = await config.flightSuretyApp.getFlightKey(address, flightNumber, dateTime);
            let policyKey = await contractInstance.getPolicyKey(flightKey, ticketNumber);

            console.log(policyKey)
            let summary = await contractInstance.fetchPolicySummary(policyKey);
            callback({
                successful: true, message : 'Policy summary fetched successful',
                summary : {
                    Id : {title : 'Policy Id', value : summary[0]},
                    insured : {title : 'Insuree', value : summary[1]},
                    ticketNumber : {title : 'Ticket Number', value : summary[2]},
                    flightId : {title : 'Flight Key', value : summary[3]},
                    premium : {title : 'Premium Paid', value : this.web3.fromWei(summary[4].toNumber(), 'ether')},
                    payout : {title : 'Pay Out', value : this.web3.fromWei(summary[5].toNumber(), 'ether')},
                    isActive : {title : 'Is Active', value : summary[6]},
                    isWithdrawn : {title : 'Is withdrawn', value : summary[7]}
                }
            })
        }
        catch(error){
            return callback({successful: false, message : error.toString()})
        }
     }
}