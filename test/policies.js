
var Test = require('../utils/testConfig.js');
var {FlightSuretyAppHelper} = require('../utils/FlightSuretyAppHelper.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety App Tests', async (accounts) => {
  const STATUS_CODE_UNKNOWN = 0;
  const STATUS_CODE_ON_TIME = 10;
  const STATUS_CODE_LATE_AIRLINE = 20;
  const STATUS_CODE_LATE_WEATHER = 30;
  const STATUS_CODE_LATE_TECHNICAL = 40;
  const STATUS_CODE_LATE_OTHER = 50;

  const airline1 = accounts[0]
  const airline2 = accounts[1]
  const airline3 = accounts[2]
  const airline4 = accounts[3]

  const passenger1 = accounts[7]
  const passenger2 = accounts[8]
  const passenger3 = accounts[9]

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

  const ticket1 = {"passenger" : passenger1, "flight" : flight1, "ticket" : "AA001001"}
  const ticket2 = {"passenger" : passenger2, "flight" : flight1, "ticket" : "AA001002"}
  const ticket3 = {"passenger" : passenger3, "flight" : flight1, "ticket" : "BB001001"}

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyApp.fund({from: airline1, value: web3.toWei(10,"ether")});

    await config.flightSuretyApp.registerAirline(airline2, {from: airline1});
    await config.flightSuretyApp.fund({from: airline2, value: web3.toWei(10,"ether")});

    await config.flightSuretyApp.registerAirline(airline3, {from: airline2});
    await config.flightSuretyApp.fund({from: airline3, value: web3.toWei(10,"ether")});

    await config.flightSuretyApp.registerAirline(airline4, {from: airline3});
    await config.flightSuretyApp.fund({from: airline4, value: web3.toWei(10,"ether")});


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

    //register Oracles
    let oracleRegistrationFee = await config.flightSuretyApp.REGISTRATION_FEE();
    oracles.forEach(async function(oracle){
      await config.flightSuretyApp.registerOracle({from : oracle, value : oracleRegistrationFee})
    })

  });

  context('Policy Purchase', () => {
    it(`Buy Policy`, async function () {

      await config.flightSuretyApp.buy(ticket1.flight.key, ticket1.ticket, {from : ticket1.passenger, value : web3.toWei(0.5,"ether")});
      let policyKey = await config.flightSuretyApp.getPolicyKey(ticket1.flight.key, ticket1.ticket);
      let policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.premium, web3.toWei(0.5,"ether"), "Premium Value is wrong")

      let flightSummary = await FlightSuretyAppHelper.fetchFlightSummary(config.flightSuretyApp, ticket1.flight.key);
      assert.equal(flightSummary.policyCount, 1, "Policy count is wrong")
    });


    it(`Buy Policy and refund`, async function () {
      let balanceBefore = web3.eth.getBalance(ticket2.passenger);
      await config.flightSuretyApp.buy(ticket2.flight.key, ticket2.ticket, {from : ticket2.passenger, value : web3.toWei(2,"ether")});

      let balanceAfter = web3.eth.getBalance(ticket2.passenger);
      let actualCost = balanceBefore - balanceAfter
      let expectedGasPrice = actualCost - web3.toWei(1,"ether")
      let actualGasUsed = web3.eth.getBlock(web3.eth.blockNumber).gasUsed

      assert.equal(actualGasUsed, Number((expectedGasPrice/100000000000).toFixed(0)), "Gas difference can only stem from wrong account transfers")
      let policyKey = await config.flightSuretyApp.getPolicyKey(ticket2.flight.key, ticket2.ticket);
      let policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.premium, web3.toWei(1,"ether"), "Premium Value is wrong")
    });

    it(`Buy Policy, top up and refund`, async function () {
      let ticket = ticket3;
      let balanceBefore = web3.eth.getBalance(ticket3.passenger);
      await config.flightSuretyApp.buy(ticket.flight.key, ticket.ticket, {from : ticket3.passenger, value : web3.toWei(0.4,"ether")});

      let balanceAfter = web3.eth.getBalance(ticket3.passenger);
      let actualCost = balanceBefore - balanceAfter
      let expectedGasPrice = actualCost - web3.toWei(0.4,"ether")
      let actualGasUsed = web3.eth.getBlock(web3.eth.blockNumber).gasUsed

      assert.equal(actualGasUsed, Number((expectedGasPrice/100000000000).toFixed(0)), "Gas difference can only stem from wrong account transfers")
      let policyKey = await config.flightSuretyApp.getPolicyKey(ticket.flight.key, ticket.ticket);
      let policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.premium, web3.toWei(0.4,"ether"), "Premium Value is wrong")

      //Top up and over pay
      balanceBefore = web3.eth.getBalance(ticket3.passenger);
      await config.flightSuretyApp.buy(ticket.flight.key, ticket.ticket, {from : ticket3.passenger, value : web3.toWei(0.7,"ether")});

      balanceAfter = web3.eth.getBalance(ticket3.passenger);
      actualCost = balanceBefore - balanceAfter
      expectedGasPrice = actualCost - web3.toWei(0.6,"ether")
      actualGasUsed = web3.eth.getBlock(web3.eth.blockNumber).gasUsed

      assert.equal(actualGasUsed, Number((expectedGasPrice/100000000000).toFixed(0)), "Gas difference can only stem from wrong account transfers")
      policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.premium, web3.toWei(1,"ether"), "Premium Value is wrong")
    });
  })


  context('Pay Claim', () => {
    // ARRANGE
    let airline = airline1
    let flight = flight1
    let timestamp = Math.floor(Date.now() / 1000);
    const ticket = ticket1;

    before('Set flight status to late', async () => {
      // Submit a request for oracles to get status information for a flight
      await config.flightSuretyApp.fetchFlightStatus(airline, flight.flightNumber, flight.time, timestamp);
      // All Oracles report delay
      for(a = 0; a < oracles.length; a++) {
        oracle = oracles[a];
        var oracleIndexes = await config.flightSuretyApp.getMyIndexes({ from: oracle });
        for(let idx=0;idx<3;idx++) {
          try {
            // Submit a response...it will only be accepted if there is an Index match
            await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx].toNumber(), airline, flight.flightNumber, flight.time, timestamp, STATUS_CODE_LATE_AIRLINE, { from: oracle });
          }
          catch(e) {
            // Enable this when debugging
            //console.log('\nError', idx, oracleIndexes[idx].toNumber(), airline, flight.flightNumber, flight.time, timestamp);
          }
        }
      }

    })

    it(`Credit Insurees`, async function () {
      let policyKey = await config.flightSuretyApp.getPolicyKey(ticket.flight.key, ticket.ticket);
      assert.equal(policyKey, "0xd59e3ef0732e0af2777389fdb2030c5550ff071ebaf9023d028258d8588e9f23", "Policy Key is wrong")
      var policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.payout.toNumber(), 0, "Start Payout Value is wrong")
      assert.equal(policySummary.Id, policyKey, "Policy Id is wrong")

      var flightSummary = await FlightSuretyAppHelper.fetchFlightSummary(config.flightSuretyApp, flight.key);
      assert.equal(flightSummary.paidoutClaims, false, "paidoutClaims should be true")
      assert.equal(flightSummary.statusCode.toNumber(), 20, "Flight Status not ready for test")

      assert.equal(flightSummary.updatedTimestamp.toNumber(), timestamp, "Flight Update timestamp is wrong")
      await config.flightSuretyApp.creditInsurees(flight.key, { from: airline1 });
      flightSummary = await FlightSuretyAppHelper.fetchFlightSummary(config.flightSuretyApp, flight.key);
      assert.equal(flightSummary.paidoutClaims, true, "paidoutClaims should be true")

      var policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.payout.toNumber(), policySummary.premium.toNumber() * 1.5, "Final Payout Value is wrong")
    })

    it(`Withdraw Payout`, async function () {
      let policyKey = await config.flightSuretyApp.getPolicyKey(ticket.flight.key, ticket.ticket);
      assert.equal(policyKey, "0xd59e3ef0732e0af2777389fdb2030c5550ff071ebaf9023d028258d8588e9f23", "Policy Key is wrong")
      var policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.payout.toNumber(), policySummary.premium.toNumber() * 1.5, "Final Payout Value is wrong")
      assert.equal(policySummary.isWithdrawn, false, "Test requires a non withdrawn payout")

      await config.flightSuretyApp.pay(policyKey, { from: ticket.passenger });


      var policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.isWithdrawn, true, "Iswithdrawn should be true")
    })

    it(`Cannot Withdraw Paid Claim`, async function () {
      let policyKey = await config.flightSuretyApp.getPolicyKey(ticket.flight.key, ticket.ticket);
      var policySummary = await FlightSuretyAppHelper.fetchPolicySummary(config.flightSuretyApp, policyKey);
      assert.equal(policySummary.isWithdrawn, true, "Iswithdrawn should be true")

      try{
        await config.flightSuretyApp.pay(policyKey, { from: ticket.passenger });
      }
      catch (error){
        assert.isTrue(error.toString().includes("revert ERROR_CLAIM_IS_ALREADY_WITHDRAWN"), "Unexpected throw recieved")
        return
      }
      assert.fail('Expected throw not recieved')

    })

  });
});