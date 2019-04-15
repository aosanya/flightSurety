import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

console.log("Loading server...")
var accounts;
var registeredOracleCount = 0
var indicesLoaded = false;
var oracles = [];
var indices = {};

const codes = [0, 10, 20, 30, 40, 50];

let config = Config['localhost'];

var provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
var web3 = new Web3(provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
var flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

loadAccounts(registerOracles, startWatching)
async function loadAccounts(callBack1, callback2){
  console.log("Load Accounts")
  web3.eth.getAccounts(async function (error, result) {
  if (error) console.log(error)
      accounts = result
      web3.eth.defaultAccount = accounts[0];
      await callBack1(callback2)
      console.log(accounts.length + " accounts loaded")
  })
}

async function registerOracles(callback){
  await fetchOracleCount();
  if (registeredOracleCount < 20){
    await installTestOracles(callback)
  }
  else{
    loadIndices(callback)
  }
}

async function fetchOracleCount(){
  await flightSuretyApp.methods.oracleCount().call({from : accounts[0]},async function (error, result) {
    registeredOracleCount = parseFloat(result)
  })
}

async function installTestOracles(callback){
  flightSuretyApp.events.OracleRegistered({
    fromBlock: 'latest'
    }, async function (error, event) {
      if (error) console.log(error)
      console.log("Registered Oracle")
      await fetchOracleCount();
      if (registeredOracleCount == 20) {
        loadIndices(callback)
      }
  });

  console.log("Registering Oracles")
  for(let a=10 + registeredOracleCount; a<30; a++) {
    try{
      flightSuretyApp.methods.registerOracle().send({ from: accounts[a], value: web3.utils.toWei("1","ether") , gas : 10000000})
    }
    catch(e){
        console.log(e)
    }
  }

}

async function loadIndices(callback){
  if (indicesLoaded == true){
    return
  }
  indicesLoaded = true;
  console.log("Load oracle indices")
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
  console.log("start watching contract events")
  flightSuretyApp.events.OracleRequest({
      fromBlock: 'latest'
    }, function (error, event) {
      if (error) console.log(error)
      console.log("Recieved Oracle Request")
      randomOracleResponse(event)
  });

  flightSuretyApp.events.FlightStatusInfo({
    fromBlock: 'latest'
  }, function (error, event) {
    if (error) console.log(error)
    console.log("flight status updated")
  });
  console.log("Server Loaded")
  console.log("Waiting for oracle requests...")

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
        try{
          flightSuretyApp.methods.submitOracleResponse(index, airline, flight, date, timestamp, response).send({from: oracleAddress}).then((receipt) => {
            console.log(receipt)
          });
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