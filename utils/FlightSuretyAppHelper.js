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
     fetchFlightSummary : async function(instance, flightId) {
        let flightSummary = await instance.fetchFlightSummary(flightId);
        return {
                Id : flightSummary[0],
                airline : flightSummary[1],
                flightNumber : flightSummary[2],
                date : flightSummary[3],
                isRegistered : flightSummary[4],
                statusCode : flightSummary[5],
                updatedTimestamp : flightSummary[6],
                votes : flightSummary[7].toNumber(),
                canBeInsured : flightSummary[8],
                policyCount : flightSummary[9].toNumber(),
                paidoutClaims : flightSummary[10]
        }
     },
     fetchPolicySummary : async function(instance, policyId) {
        let policySummary = await instance.fetchPolicySummary(policyId);
        return {
                Id : policySummary[0],
                insured : policySummary[1],
                ticketNumber : policySummary[2],
                flightId : policySummary[3],
                premium : policySummary[4],
                payout : policySummary[5],
                isActive : policySummary[6],
                isWithdrawn : policySummary[7]
        }
     }
}
module.exports.FlightSuretyAppHelper = FlightSuretyAppHelper;