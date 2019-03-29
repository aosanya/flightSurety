
var Test = require('../utils/testConfig.js');
var {FlightSuretyAppHelper} = require('../utils/FlightSuretyAppHelper.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety App Tests', async (accounts) => {
  const airline1 = accounts[0]
  const airline2 = accounts[1]
  const airline3 = accounts[2]
  const airline4 = accounts[3]
  const airline5 = accounts[4]
  const airline6 = accounts[5]
  const airline7 = accounts[6]
  const airline8 = accounts[7]
  const airline9 = accounts[8]
  const airline10 = accounts[9]

  const flight1 = {"airline" : airline1, "flightNumber" : "AA001", "time" : new Date(2019,01,01,08,00) / 1000, key : "0xcbaa35fdc6f4b18e88d9ed55d4934a2b7d6c9c1d9a348db3f6f133d3d9bf4c65"}
  const flight2 = {"airline" : airline1, "flightNumber" : "AA001", "time" : new Date(2019,02,01,08,00) / 1000, key : "0xa970d9a96a7d46b67f56443b0c7dd61951e3ba6ef521ed0a3d280d1250f3c3af"}
  const flight3 = {"airline" : airline2, "flightNumber" : "BB001", "time" : new Date(2019,03,01,08,00) / 1000, key : "0x8b7f1cdf1105030ea4d859fecfc125b42efb069a15df8cf1efffe168379259e4"}
  const flight4 = {"airline" : airline3, "flightNumber" : "CC001", "time" : new Date(2019,04,01,08,00) / 1000, key : "0x7bf71f9e08be7aef25e8c59356d6ce773eaf12ccfb1ccd1ec602da2ff32ef2e5"}
  const flight5 = {"airline" : airline4, "flightNumber" : "DD001", "time" : new Date(2019,05,01,08,00) / 1000, key : "0x530f9044bd37b1d7e3c467234a3f6476cec72b3b69ce400d4ca0df71f75bd309"}
  const flight6 = {"airline" : airline5, "flightNumber" : "EE001", "time" : new Date(2019,06,01,08,00) / 1000, key : "0x8a59925476d8ee3d0d5e790e3a6a21bf25ab167bbe283d6d5f0fe894649f19dd"}
  const flight7 = {"airline" : airline6, "flightNumber" : "FF001", "time" : new Date(2019,07,01,08,00) / 1000, key : "0x9e67da410ca1482f54011491995d53c35788bad9be5bb14b2e9da79da407ea69"}

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
  });

  context('Require Quorum', () => {
    it(`Cannot Register Flight Without Quorom`, async function () {
      let isAirline = await config.flightSuretyApp.isAirline(airline1);
      assert.equal(isAirline, true, "airline not registered");


      try{
        let results = await config.flightSuretyApp.registerFlight(airline1, flight1.flightNumber, flight1.time, {from: airline1});
      }
      catch (error){
        assert.isTrue(error.toString().includes("revert ERROR_NO_QUORUM"), "Unexpected throw recieved")
        return
      }
      assert.fail('Expected throw not recieved')
    });


  })


  context('Require Quorum', () => {
    before('Register Airlines', async () => {
      await config.flightSuretyApp.fund({from: airline1, value: config.web3.utils.toWei("10","ether")});

      await config.flightSuretyApp.registerAirline(airline2, {from: airline1});
      await config.flightSuretyApp.fund({from: airline2, value: config.web3.utils.toWei("10","ether")});

      await config.flightSuretyApp.registerAirline(airline3, {from: airline2});
      await config.flightSuretyApp.fund({from: airline3, value: config.web3.utils.toWei("10","ether")});

      await config.flightSuretyApp.registerAirline(airline4, {from: airline3});
      await config.flightSuretyApp.fund({from: airline4, value: config.web3.utils.toWei("10","ether")});
    });

    it(`Can Register Flight`, async function () {

      let airlinesSummary = await FlightSuretyAppHelper.getAirlinesSummary(config.flightSuretyApp);
      assert.equal(airlinesSummary.registered, 4, "airline count is wrong");
      assert.equal(airlinesSummary.consensus, 2, "required consensus is wrong");

      let isFlightRegistered = await config.flightSuretyApp.isFlightRegistered(airline1, flight1.flightNumber, flight1.time, {from: airline1} );
      assert.equal(isFlightRegistered, false, "flight should not be registered");

      let results = await config.flightSuretyApp.registerFlight(airline1, flight1.flightNumber, flight1.time, {from: airline1});
      isFlightRegistered = await config.flightSuretyApp.isFlightRegistered(airline1, flight1.flightNumber, flight1.time, {from: airline1} );
      assert.equal(isFlightRegistered, false, "flight should not be registered");

      results = await config.flightSuretyApp.registerFlight(airline1, flight1.flightNumber, flight1.time, {from: airline2});
      isFlightRegistered = await config.flightSuretyApp.isFlightRegistered(airline1, flight1.flightNumber, flight1.time, {from: airline2} );
      assert.equal(isFlightRegistered, true, "flight should be registered");

      let flightKey = await config.flightSuretyApp.getFlightKey(airline1, flight1.flightNumber, flight1.time, {from: airline2});
      console.log(flightKey)
    });


  })

});
