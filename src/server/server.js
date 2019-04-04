import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

var accounts;
var oracles = [];
var indices = {};

const codes = [0, 10, 20, 30, 40, 50];

let config = Config['localhost'];
var provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
var web3 = new Web3(provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
var flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


loadAccounts(loadIndices, startWatching)
function loadAccounts(callBack1, callback2){
  web3.eth.getAccounts(function (error, result) {
    if (error) console.log(error)
      accounts = result
      web3.eth.defaultAccount = accounts[0];
      callBack1(callback2)
  })
}

function loadIndices(callback){
  for(let a=10; a<30; a++) {
    flightSuretyApp.methods.getMyIndexes().call({from : accounts[a]}, function (error, result) {
      oracles.push(accounts[a]);
      indices[accounts[a]] = result;
      if (a == 29){
        callback();
      }
    })
  }
}

function startWatching(){
  flightSuretyApp.events.OracleRequest({
      fromBlock: 0
    }, function (error, event) {
      if (error) console.log(error)
      randomOracleResponse(event)
  });

  flightSuretyApp.events.FlightStatusInfo({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log("flight status updated")
  });
}


function randomOracleResponse(requestEvent){
  let index = requestEvent.returnValues[0]
  let airline = requestEvent.returnValues[1]
  let flight = requestEvent.returnValues[2]
  let date = requestEvent.returnValues[3]
  let timestamp = requestEvent.returnValues[4]
  let response = codes[Math.floor(Math.random()*4) + 1]

  for (var i = 0; i < oracles.length; i++) {
    var oracleAddress = oracles[i]

    if (indices[oracleAddress].includes(requestEvent.returnValues[0])){
        var tx = {from: oracleAddress};
        try{
          flightSuretyApp.methods.submitOracleResponse(index, airline, flight, date, timestamp, response).call(tx,(error, result) => {
              if (error) console.log(error)
          })
        }
        catch(e){
          console.log(e)
        }
    }
  }
}

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;