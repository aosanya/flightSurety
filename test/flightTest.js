
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
  })
});
