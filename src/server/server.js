import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


// let config = Config['localhost'];
// let address = '0x447db080264bed6ed21d3a082ae4cdd7ebfe4e32';

// var accounts;
// var oracles = [];
// var indices = {};

// const STATUS_CODE_UNKNOWN = 0;
// const STATUS_CODE_ON_TIME = 10;
// const STATUS_CODE_LATE_AIRLINE = 20;
// const STATUS_CODE_LATE_WEATHER = 30;
// const STATUS_CODE_LATE_TECHNICAL = 40;
// const STATUS_CODE_LATE_OTHER = 50;

// const codes = [0, 10, 20, 30, 40, 50];



// let web3Ws = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
// let web3Http = new Web3(new Web3.providers.HttpProvider(config.url));
// console.log(web3Ws.version);

// var flightSuretyApp;
// var flightSuretyAppHttp;

// web3Ws.eth.getAccounts(function (error, result) {
//   if (error) console.log(error)
//   accounts = result
//   web3Ws.eth.defaultAccount = accounts[0];
//   flightSuretyApp = new web3Ws.eth.Contract(FlightSuretyApp.abi, address);
//   flightSuretyAppHttp = new web3Http.eth.Contract(FlightSuretyApp.abi, address);

//   loadIndices(startWatchingOracleReqeusts);

// })

// //Oracle Initialization
// //20 oracles are registered and their assigned indexes are persisted in memory
// async function loadIndices(callback){
//   for(let a=10; a<30; a++) {
//     let indices = await flightSuretyApp.methods.getMyIndexes().call({from : accounts[a]})
//     oracles.push(accounts[a]);
//     indices[accounts[a]] = indices;
//     if (a==29){
//       callback()
//     }
//   }
// }


// async function startWatchingOracleReqeusts(){
// //   flightSuretyApp.events.allEvents({fromBlock: 0, toBlock : 'latest'}, function (error, event) {
// //     if (error) console.log(error)
// //     //console.log(event)
// //     if (event == 'OracleRequest'){
// //       console.log(event)
// //       //randomOracleResponse(event)
// //     }
// //     else if (event == 'FlightStatusInfo'){
// //       console.log("status of flight " + event.returnValues[1] + " is " + event.returnValues[4])
// //     }
// //     else if (event == 'OracleResponse'){
// //       console.log("Oracle Response for " + event.returnValues[0], event.returnValues[1], event.returnValues[2], event.returnValues[3], event.returnValues[4], event.returnValues[5], event.returnValues[6] )
// //     }
// //     else if (event == 'OracleReport'){
// //       console.log("Oracle Report for " + event.returnValues[0], event.returnValues[1], event.returnValues[2], event.returnValues[3], event.returnValues[4] )
// //     }

// // });

//   console.log("Watch events for : ", config.appAddress)


//   flightSuretyApp.events.OracleRequest({
//     fromBlock: 0
//   }, function (error, event) {
//     if (error) console.log(error)
//     console.log(event)
// });




//   // flightSuretyApp.events.OracleRequest({fromBlock: 0}).then()


//   //   , function (error, event) {
//   //     if (error) console.log(error)
//   //     console.log("Oracle Request " + event.returnValues)
//   //     //randomOracleResponse(event)
//   // });

//   // await flightSuretyApp.events.FlightStatusInfo((err, events)=>{
//   //   console.log(err, events)}
//   // )
//   //   if (error) console.log(error)
//   //   console.log(res)
//   //   //console.log("status of flight " + event.returnValues[1] + " is " + event.returnValues[4])
//   // });

//   // flightSuretyApp.events.OracleResponse({fromBlock: 0, toBlock : "latest"}, function (error, event) {
//   //   if (error) console.log(error)
//   //   console.log("Oracle Response for " + event.returnValues[0], event.returnValues[1], event.returnValues[2], event.returnValues[3], event.returnValues[4], event.returnValues[5], event.returnValues[6] )
//   // });

//   // flightSuretyApp.events.OracleReport({fromBlock: 0, toBlock : "latest"}, function (error, event) {
//   //   if (error) console.log(error)
//   //   console.log("Oracle Report for " + event.returnValues[0], event.returnValues[1], event.returnValues[2], event.returnValues[3], event.returnValues[4] )
//   // });

//   function randomOracleResponse(requestEvent){
//     let index = requestEvent.returnValues[0].toNumber()
//     let airline = requestEvent.returnValues[1]
//     let flight = requestEvent.returnValues[2]
//     let date = requestEvent.returnValues[3].toNumber()
//     let timestamp = requestEvent.returnValues[4].toNumber()
//     let response = codes[Math.floor(Math.random()*4) + 1].toNumber()


//     for (var i = 0; i < oracles.length; i++) {
//       var oracleAddress = oracles[i]
//       if (indices[oracleAddress].includes(requestEvent.returnValues[0])){
//           // console.log(indices[oracleAddress],requestEvent.returnValues[0] )
//           // console.log(index, airline, flight, date, timestamp, response, "address" , oracleAddress)
//           var tx = {from: oracleAddress};
//           // flightSuretyApp.methods.getSender().call(tx,(error, result) => {
//           //   if (error) console.log(error)
//           //     console.log(result)
//           // })
//           // try{
//           //   console.log("test1")
//           //   flightSuretyAppHttp.methods.submitOracleResponse(index, airline, flight, date, timestamp, response).call(tx,(error, result) => {
//           //       if (error) console.log(error)
//           //       console.log("response submitted2")

//           //     })
//           // }
//           // catch(e){
//           //   console.log("test2")
//           // }


//       }
//     }
//   }
// }

// const app = express();
// app.get('/api', (req, res) => {
//     res.send({
//       message: 'An API for use with your Dapp!'
//     })
// })
// export default app;


