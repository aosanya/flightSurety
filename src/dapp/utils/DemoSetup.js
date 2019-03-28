import Config from '../../../utils/config.json';

export default class DemoSetup {
    constructor(callback, contractInstance) {
        this.accounts = null;
        this.contractInstance = contractInstance;
        let config = Config['localhost'];
        console.log(contractInstance)
        this.owner = null;
        this.airlines = [];
        this.passengers = [];


        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));

        this.getAccounts()
    }

    async getAccounts(callback) {
        // Retrieving accounts
        this.web3.eth.getAccounts((err, res) => {
            if (err) {
                console.log('Error:',err);
                return;
            }
            this.accounts =  res;
            this.owner = res[0];

            let counter = 1;

            while(this.airlines.length < 5) {
                this.airlines.push(res[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(res[counter++]);
            }

        })
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
        var contractAppArtifact = FlightSuretyAppJson;
        this.contracts.FlightSuretyApp = TruffleContract(contractAppArtifact);
        this.contracts.FlightSuretyApp.setProvider(this.web3Provider);

        var contractDataArtifact = FlightSuretyDataJson;
        this.contracts.FlightSuretyData = TruffleContract(contractDataArtifact);
        this.contracts.FlightSuretyData.setProvider(this.web3Provider);

        this.fetchEvents(callback);
        callback(this)
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
}