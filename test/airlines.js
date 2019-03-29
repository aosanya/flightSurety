
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


  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);

  });

  context('Initialization', () => {
    it(`First airline is registered when contract is deployed`, async function () {
      let isAirline = await config.flightSuretyApp.isAirline(airline1);
      assert.equal(isAirline, true, "airline not registered");
      let airlinesSummary = await FlightSuretyAppHelper.getAirlinesSummary(config.flightSuretyApp);
      assert.equal(airlinesSummary.registered, 1, "airline count is wrong");
      assert.equal(airlinesSummary.consensus, 0, "required consensus is wrong");
    });

    it(`First airline has contributed and registration roles have been awarded`, async function () {

      await config.flightSuretyApp.fund({from: airline1, value: config.web3.utils.toWei("10","ether")});
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline1);
      assert.equal(airline.contribution, config.web3.utils.toWei("10","ether"), "does not have contribution");
    });

  })

  context('Only existing airline may register a new airline until there are at least four airlines registered', () => {
    it(`Airline1 can register airline 2`, async function () {
        let summary1 = await config.flightSuretyApp.fetchAirlinesSummary();
        await config.flightSuretyApp.registerAirline(airline2, {from: airline1});
        var isAirline = await config.flightSuretyApp.isAirline(airline2);
        assert.equal(isAirline, true, "airline not registered");

        let airlinesSummary = await FlightSuretyAppHelper.getAirlinesSummary(config.flightSuretyApp);
        assert.equal(airlinesSummary.registered, 2, "airline count is wrong");
        assert.equal(airlinesSummary.registrationQueue, 0, "registration queue count is wrong");
        assert.equal(airlinesSummary.consensus, 1, "required consensus is wrong");

        await config.flightSuretyApp.fund({from: airline2, value: config.web3.utils.toWei("10","ether")});
      }
    )

    it(`Airline2 can register airline 3`, async function () {
        await config.flightSuretyApp.registerAirline(airline3, {from: airline2});
        isAirline = await config.flightSuretyApp.isAirline(airline3);
        assert.equal(isAirline, true, "airline not registered");

        let airlinesSummary = await FlightSuretyAppHelper.getAirlinesSummary(config.flightSuretyApp);
        assert.equal(airlinesSummary.registered, 3, "airline count is wrong");
        assert.equal(airlinesSummary.registrationQueue, 0, "registration queue count is wrong");
        assert.equal(airlinesSummary.consensus, 1, "required consensus is wrong");

        await config.flightSuretyApp.fund({from: airline3, value: config.web3.utils.toWei("10","ether")});
      }
    )

    it(`Airline4 cannot register airline 5`, async function () {
      let summary1 = await config.flightSuretyApp.fetchAirlinesSummary();
      isAirline = await config.flightSuretyApp.isAirline(airline5);
      assert.equal(isAirline, false, "airline is already registered");

      try{
          await config.flightSuretyApp.registerAirline(airline5, {from: airline4});
      }
      catch (error){
          assert.isTrue(error.toString().includes("revert ERROR_MISSING_AIRLINE_REGISTRATION_PERMISSION"), "Unexpected throw recieved")
          let summary2 = await config.flightSuretyApp.fetchAirlinesSummary();
          assert.equal(summary1.registered, summary2.registered, "airline count is wrong");
          return
      }
      assert.fail('Expected throw not recieved')
    });

    it(`Airline3 can register airline 4`, async function () {
        await config.flightSuretyApp.registerAirline(airline4, {from: airline3});
        isAirline = await config.flightSuretyApp.isAirline(airline4);
        assert.equal(isAirline, true, "airline not registered");

        var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline4);
        assert.equal(airline.isRegistered, true, "airline not registered");

        let airlinesSummary = await FlightSuretyAppHelper.getAirlinesSummary(config.flightSuretyApp);
        assert.equal(airlinesSummary.registered, 4, "airline count is wrong");
        assert.equal(airlinesSummary.registrationQueue, 0, "registration queue count is wrong");
        assert.equal(airlinesSummary.consensus, 2, "required consensus is wrong");

        await config.flightSuretyApp.fund({from: airline4, value: config.web3.utils.toWei("10","ether")});
      }
    )

    it(`Airline4 cannot register airline 5 without consensus`, async function () {
          await config.flightSuretyApp.registerAirline(airline5, {from: airline4});
          isAirline = await config.flightSuretyApp.isAirline(airline5);
          assert.equal(isAirline, true, "airline not enlisted");

          var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline5);
          assert.equal(airline.isRegistered, false, "airline not registered");

          let airlinesSummary = await FlightSuretyAppHelper.getAirlinesSummary(config.flightSuretyApp);
          assert.equal(airlinesSummary.registered, 4, "airline count is wrong");
          assert.equal(airlinesSummary.registrationQueue, 1, "registration queue count is wrong");
          assert.equal(airlinesSummary.consensus, 2, "required consensus is wrong");

      }
    )
  })

  context('Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines', () => {
    it(`Airline5 has 1 vote`, async function () {
        var airline = await config.flightSuretyApp.fetchAirlineSummary(airline5);
        assert.equal(airline[0].toNumber(), 1, "airline has wrong votes");
      }
    )

    it(`Airline cannot vote twice`, async function () {
        var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline5);
        assert.equal(airline.votes, 1, "airline has wrong votes");

        try{
          await config.flightSuretyApp.registerAirline(airline5, {from: airline4});
        }
        catch (error){
          assert.isTrue(error.toString().includes("revert ERROR_AIRLINE_HAS_ALREADY_VOTED_FOR_THIS_AIRLINE"), "Unexpected throw recieved")
          var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline5);
          assert.equal(airline.votes, 1, "airline has wrong votes");
          return
        }

        assert.fail('Expected throw not recieved')
      }
    )

    it(`Airline can vote`, async function () {
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline5);
      assert.equal(airline.votes, 1, "airline has wrong votes");

      let airlinesSummary = await FlightSuretyAppHelper.getAirlinesSummary(config.flightSuretyApp);
      assert.equal(airlinesSummary.consensus, 2, "required consensus is wrong");


      await config.flightSuretyApp.registerAirline(airline5, {from: airline1});
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline5);
      assert.equal(airline.votes, 2, "airline has wrong votes");
      assert.equal(airlinesSummary.consensus <= airline.votes, true, "consensus not attained");
      assert.equal(airline.isRegistered, true, "airline should be registered");

    }
  )
    it(`Register Airline 6`, async function () {
      try{
        var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline6);
        assert.fail('Expected throw not recieved')
      }
      catch (error){
        assert.isTrue(error.toString().includes("revert ERROR_AIRLINE_NOT_ENLISTED"), "Unexpected throw recieved")
      }

      await config.flightSuretyApp.registerAirline(airline6, {from: airline1});
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline6);
      assert.equal(airline.votes, 1, "airline has wrong votes");
      assert.equal(airline.isRegistered, false, "airline should not be registered");

      await config.flightSuretyApp.registerAirline(airline6, {from: airline2});
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline6);
      assert.equal(airline.votes, 2, "airline has wrong votes");
      assert.equal(airline.isRegistered, true, "airline should not be registered");
      }
    )

    it(`Register Airline 7`, async function () {
      try{
        var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline7);
        assert.fail('Expected throw not recieved')
      }
      catch (error){
        assert.isTrue(error.toString().includes("revert ERROR_AIRLINE_NOT_ENLISTED"), "Unexpected throw recieved")
      }

      await config.flightSuretyApp.registerAirline(airline7, {from: airline1});
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline7);
      assert.equal(airline.votes, 1, "airline has wrong votes");
      assert.equal(airline.isRegistered, false, "airline should not be registered");

      await config.flightSuretyApp.registerAirline(airline7, {from: airline2});
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline7);
      assert.equal(airline.votes, 2, "airline has wrong votes");
      assert.equal(airline.isRegistered, false, "airline should not be registered");

      await config.flightSuretyApp.registerAirline(airline7, {from: airline3});
      var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline7);
      assert.equal(airline.votes, 3, "airline has wrong votes");
      assert.equal(airline.isRegistered, true, "airline should be registered");
      }
    )


  })

  context('Airline can be registered, but does not participate in contract until it submits funding of 10 ether', () => {
      it(`Fund Airline`, async function () {
        var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline7);
        assert.equal(airline.isRegistered, true, "airline should be registered");


        await config.flightSuretyApp.fund({from: airline7, value: config.web3.utils.toWei("10","ether")});
        var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline7);
        assert.equal(airline.contribution, config.web3.utils.toWei("10","ether"), "airline has wrong contribution");
      })
    }
  )

  context('Miscelleneous', () => {
    it(`Cannot register already registered airline`, async function () {
        var airline = await FlightSuretyAppHelper.getAirlineSummary(config.flightSuretyApp, airline7);
        assert.equal(airline.isRegistered, true, "airline should not be registered");

        try{
          await config.flightSuretyApp.registerAirline(airline7, {from: airline4});
          assert.fail('Expected throw not recieved')
        }
        catch (error){
          assert.isTrue(error.toString().includes("revert ERROR_AIRLINE_IS_ALREADY_REGISTERED"), "Unexpected throw recieved")
        }
      }
    )
  })
});
