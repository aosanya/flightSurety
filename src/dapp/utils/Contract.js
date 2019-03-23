import Config from '../../../utils/config.json';
import web3Utils from '../../../utils/web3Utils';
import FlightSuretyAppJson from '../../../build/contracts/FlightSuretyApp.json'
import demoSetup from './DemoSetup'

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
        callback(this)
        this.getMetaskAccountID(callback);
        this.initContract(callback);

    }

    async initContract(callback) {
        var contractArtifact = FlightSuretyAppJson;
        this.contracts.FlightSuretyApp = TruffleContract(contractArtifact);
        this.contracts.FlightSuretyApp.setProvider(this.web3Provider);
        this.fetchEvents(callback);

        callback(this)
    }

    async fetchEvents(callback) {
        console.log("1")
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
        console.log("2")
        this.contracts.FlightSuretyApp.at(this.contract).then(function(instance) {

            var events = instance.allEvents(function(err, log){
            if (!err)
                console.log(log.event + ' - ' + log.transactionHash);
            });
            if (callback != undefined){
                callback(this)
            }
        }).catch(function(err) {
            console.log(err.message);
        });


    }

    async getMetaskAccountID(callback) {
        // Retrieving accounts
        this.web3.eth.getAccounts((err, res) => {
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
            const demo = new demoSetup(null, instance)
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

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
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
        console.log(address)
        console.log(flightNumber)
        console.log(dateTime)
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


}