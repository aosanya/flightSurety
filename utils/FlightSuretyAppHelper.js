var FlightSuretyAppHelper = {
    getAirlinesSummary : async function(instance) {
        let airlinesSummary = await instance.fetchAirlinesSummary();
        return {
                registered : airlinesSummary[0].toNumber(),
                registrationQueue : airlinesSummary[1].toNumber(),
                quorum : airlinesSummary[2].toNumber(),
                consensusPercentage : airlinesSummary[3].toNumber(),
                consensus : airlinesSummary[4].toNumber()
        }
     },
     getAirlineSummary : async function(instance, address) {
        let airlineSummary = await instance.fetchAirlineSummary(address);
        return {
                votes : airlineSummary[0].toNumber(),
                isRegistered : airlineSummary[1],
                contribution : airlineSummary[2].toNumber(),
        }
     },
}
module.exports.FlightSuretyAppHelper = FlightSuretyAppHelper;