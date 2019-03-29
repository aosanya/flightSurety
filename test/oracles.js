
var Test = require('../utils/testConfig.js');
var {FlightSuretyAppHelper} = require('../utils/FlightSuretyAppHelper.js');
//var BigNumber = require('bignumber.js');

contract('Oracles', async (accounts) => {


  const TEST_ORACLES_COUNT = 3;

  const airline1 = accounts[0]
  const airline2 = accounts[1]
  const airline3 = accounts[2]
  const airline4 = accounts[3]

  const oracle1 = accounts[10]
  const oracle2 = accounts[11]
  const oracle3 = accounts[12]
  const oracle4 = accounts[13]
  const oracle5 = accounts[14]
  const oracle6 = accounts[15]
  const oracle7 = accounts[16]
  const oracle8 = accounts[17]
  const oracle9 = accounts[18]
  const oracle10 = accounts[19]



  const oracles = [oracle1, oracle2, oracle3, oracle4, oracle5, oracle6, oracle7, oracle8, oracle9, oracle10]


  const flight1 = {"airline" : airline1, "flightNumber" : "AA001", "time" : new Date(2019,01,01,08,00) / 1000, key : "0xcbaa35fdc6f4b18e88d9ed55d4934a2b7d6c9c1d9a348db3f6f133d3d9bf4c65"}
  const flight2 = {"airline" : airline1, "flightNumber" : "AA001", "time" : new Date(2019,02,01,08,00) / 1000, key : "0xa970d9a96a7d46b67f56443b0c7dd61951e3ba6ef521ed0a3d280d1250f3c3af"}
  const flight3 = {"airline" : airline2, "flightNumber" : "BB001", "time" : new Date(2019,03,01,08,00) / 1000, key : "0x8b7f1cdf1105030ea4d859fecfc125b42efb069a15df8cf1efffe168379259e4"}
  const flight4 = {"airline" : airline3, "flightNumber" : "CC001", "time" : new Date(2019,04,01,08,00) / 1000, key : "0x7bf71f9e08be7aef25e8c59356d6ce773eaf12ccfb1ccd1ec602da2ff32ef2e5"}
  const flight5 = {"airline" : airline4, "flightNumber" : "DD001", "time" : new Date(2019,05,01,08,00) / 1000, key : "0x530f9044bd37b1d7e3c467234a3f6476cec72b3b69ce400d4ca0df71f75bd309"}


  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);

    // Watch contract events
    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;


    config = await Test.Config(accounts);
    await config.flightSuretyApp.fund({from: airline1, value: config.web3.utils.toWei("10","ether")});

    await config.flightSuretyApp.registerAirline(airline2, {from: airline1});
    await config.flightSuretyApp.fund({from: airline2, value: config.web3.utils.toWei("10","ether")});

    await config.flightSuretyApp.registerAirline(airline3, {from: airline2});
    await config.flightSuretyApp.fund({from: airline3, value: config.web3.utils.toWei("10","ether")});

    await config.flightSuretyApp.registerAirline(airline4, {from: airline3});
    await config.flightSuretyApp.fund({from: airline4, value: config.web3.utils.toWei("10","ether")});


    //Register Flight 1
    await config.flightSuretyApp.registerFlight(airline1, flight1.flightNumber, flight1.time, {from: airline1});
    await config.flightSuretyApp.registerFlight(airline1, flight1.flightNumber, flight1.time, {from: airline2});

    //Register Flight 2
    await config.flightSuretyApp.registerFlight(flight2.airline, flight2.flightNumber, flight2.time, {from: airline1});
    await config.flightSuretyApp.registerFlight(flight2.airline, flight2.flightNumber, flight2.time, {from: airline2});

    //Register Flight 3
    await config.flightSuretyApp.registerFlight(flight3.airline, flight3.flightNumber, flight3.time, {from: airline1});
    await config.flightSuretyApp.registerFlight(flight3.airline, flight3.flightNumber, flight3.time, {from: airline2});

    //Register Flight 4
    await config.flightSuretyApp.registerFlight(flight4.airline, flight4.flightNumber, flight4.time, {from: airline1});
    await config.flightSuretyApp.registerFlight(flight4.airline, flight4.flightNumber, flight4.time, {from: airline2});

    //Register Flight 5
    await config.flightSuretyApp.registerFlight(flight5.airline, flight5.flightNumber, flight5.time, {from: airline1});
    await config.flightSuretyApp.registerFlight(flight5.airline, flight5.flightNumber, flight5.time, {from: airline2});


  });




  it('can register oracles', async () => {

    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

    // ACT
    for(let a=7; a<TEST_ORACLES_COUNT; a++) {
      await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
      let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
    }
  });

  it('can request flight status', async () => {
    // ARRANGE
    let airline = airline1
    let flight = flight1
    let timestamp = Math.floor(Date.now() / 1000);

    // Submit a request for oracles to get status information for a flight
    await config.flightSuretyApp.fetchFlightStatus(airline, flight.flightNumber, flight.time, timestamp);
    // ACT

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for(let a=7; a<TEST_ORACLES_COUNT; a++) {

      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});
      for(let idx=0;idx<3;idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
          await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, date, timestamp, STATUS_CODE_ON_TIME, { from: accounts[a] });

        }
        catch(e) {
          // Enable this when debugging
          // console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
        }

      }
    }


  });



});
