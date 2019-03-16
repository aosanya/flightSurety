pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Accesscontrol.sol";
import "./flightSuretyData.sol";
/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp is FlightSuretyData, AccessControl {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    string private constant ERROR_CONTRACT_NOT_OPERATIONAL = "ERROR_CONTRACT_NOT_OPERATIONAL";
    string private constant ERROR_NO_QUORUM = "ERROR_NO_QUORUM";

    string private constant ERROR_CALLER_NOT_CONTRACT_OWNER = "ERROR_CALLER_NOT_CONTRACT_OWNER";
    string private constant ERROR_AIRLINE_IS_NOT_REGISTERED = "ERROR_AIRLINE_IS_NOT_REGISTERED";
    string private constant ERROR_AIRLINE_IS_ALREADY_REGISTERED = "ERROR_AIRLINE_IS_ALREADY_REGISTERED";
    string private constant ERROR_AIRLINE_ALREADY_VOTED_FOR_AIRLINE = "ERROR_AIRLINE_HAS_ALREADY_VOTED_FOR_THIS_AIRLINE";

    string private constant ERROR_FLIGHT_IS_NOT_REGISTERED = "ERROR_FLIGHT_IS_NOT_REGISTERED";
    string private constant ERROR_FLIGHT_IS_ALREADY_REGISTERED = "ERROR_FLIGHT_IS_ALREADY_REGISTERED";
    string private constant ERROR_AIRLINE_ALREADY_VOTED_FOR_FLIGHT = "ERROR_AIRLINE_HAS_ALREADY_VOTED_FOR_THIS_FLIGHT";


    address private contractOwner;          // Account used to deploy contract

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    modifier requireHasQuorum()
    {
        require(hasQuorum() == true, ERROR_NO_QUORUM);
        _;
    }

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
         // Modify to call data contract's status
        require(true, ERROR_CONTRACT_NOT_OPERATIONAL);
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    modifier requireIsRegistered(address _airlineAddress)
    {
        Airline storage airline_ = airlines[_airlineAddress];
        require(airline_.isRegistered == true, ERROR_AIRLINE_IS_NOT_REGISTERED);
        _;
    }

    modifier requireNonRegisteredAirline(address _airlineAddress)
    {
        Airline storage airline_ = airlines[_airlineAddress];
        require(airline_.isRegistered == false, ERROR_AIRLINE_IS_ALREADY_REGISTERED);
        _;
    }

    modifier requireNonRegisteredFlight(
        address     _airline,
        string      _flight,
        uint256     _date
    )
    {
        require(isFlightRegistered(_airline, _flight, _date) == false, ERROR_FLIGHT_IS_ALREADY_REGISTERED);
        _;
    }


    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, ERROR_CALLER_NOT_CONTRACT_OWNER);
        _;
    }

    modifier requireNotYetVotedAirlineXAirline(address _voter, address _votingFor)
    {
        Airline storage airline_ = airlines[_votingFor];
        require(airline_.votedBy[_voter] == false, ERROR_AIRLINE_ALREADY_VOTED_FOR_AIRLINE);
        _;
    }

    modifier requireNotYetVotedAirlineXFlight(address _voter, bytes32 _votingForFlightId)
    {
        Flight storage flight_ = flights[_votingForFlightId];
        require(flight_.votedBy[_voter] == false, ERROR_AIRLINE_ALREADY_VOTED_FOR_FLIGHT);
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor() public
    {
        contractOwner = msg.sender;
        Airline storage airline_ = addAirline(msg.sender);
        incorporateAirline(airline_);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return true;  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/


   /**
    * @dev Add an airline to the registration queue
    *
    */
    function registerAirline(address _airlineAddress)
                            public
                            canRegisterAirline()
                            requireNonRegisteredAirline(_airlineAddress)
                            returns(bool success, uint256 votes, uint256 pendingVotes)
    {
        Airline storage airline_ = airlines[_airlineAddress];
        if (airline_.exists == false) {
            airline_ = addAirline(_airlineAddress);
            if (hasQuorum() == false){
                incorporateAirline(airline_);
                success = true;
                return (success, airline_.votes, 0);
            }
        }

        success = voteAirlineXAirline(airline_);

        return (success, airline_.votes, 0);
    }

    function incorporateAirline(Airline storage _airline)
                            private
    {
        _airline.isRegistered = true;
        registered += 1;
        registrationQueue -= 1;
        consensus = registered.mul(consensusPercentage).div(100);
    }

    function voteAirlineXAirline(Airline storage _airline)
        private
        requireNotYetVotedAirlineXAirline(msg.sender, _airline.id)
        returns(bool isRegistered_)
    {
        _airline.votes += 1;
        _airline.votedBy[msg.sender] = true;
        if (consensus <= _airline.votes){
            incorporateAirline(_airline);
            isRegistered_ = true;
        }
    }

    function registerFlight(
        address     _airline,
        string      _flight,
        uint256     _date
    )
        public
        requireHasQuorum()
        canRegisterFlight()
        requireNonRegisteredFlight(_airline, _flight, _date)
        returns(bool success, uint256 votes, uint256 pendingVotes)
    {
        bytes32 flightId = getFlightKey(_airline, _flight, _date);
        Flight storage flight_ = flights[flightId];
        if (flight_.exists == false) {
            flight_ = addFlight(_airline, _flight, _date, STATUS_CODE_UNKNOWN);
        }

        success = voteAirlineXFlight(flight_);

        return (success, flight_.votes, 0);
    }

    function voteAirlineXFlight(Flight storage _flight)
                            private
                            requireNotYetVotedAirlineXFlight(msg.sender, _flight.Id)
                            returns(bool isRegistered_)
    {
        _flight.votes += 1;
        _flight.votedBy[msg.sender] = true;
        if (consensus <= _flight.votes){
            incorporateFlight(_flight);
            isRegistered_ = true;
        }
    }

    function incorporateFlight(Flight storage _flight)
                            private
    {
        _flight.isRegistered = true;
    }

    /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                            )
                            public
                            requireIsRegistered(msg.sender)
                            payable
    {
        contribute();
        Airline storage airline_ = airlines[msg.sender];
        if (airline_.contribution >= minimumContribution){
            addPermission(AIRLINE_REGISTRATION_ROLE, msg.sender, "");
            addPermission(FLIGHT_REGISTRATION_ROLE, msg.sender, "");
            addPermission(CLAIMS_PAYOUT_ROLE, msg.sender, "");
        }
    }

    event creditingInsuree(bytes32 policy);

    /**
    *  @dev Credits payouts to insurees
    */
    function creditInsurees
    (
        bytes32  _flightId
    )
    external
    canPayoutClaims()
    requireFlightExist(_flightId)
    {

        Flight storage flight_ = flights[_flightId];
        require(flight_.statusCode > 10, ERROR_POLICY_CANNOT_CLAIM);
        require(flight_.paidoutClaims == false, ERROR_ALREADY_PAIDOUT_CLAIMS);
        for(uint i = 1 ; i <= flight_.policyCount; i++) {
            emit creditingInsuree(flight_.policies[i]);
            creditInsuree(flight_.policies[i]);
        }
        flight_.paidoutClaims = true;
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund();
    }


   /**
    * @dev Called after oracle has updated flight status
    *
    */
    function processFlightStatus
    (
        address         _airline,
        string memory   _flight,
        uint256         _date,
        uint256         _timestamp,
        uint8           _statusCode
    )
    internal
    {
        bytes32 flightId = getFlightKey(_airline, _flight, _date);

        Flight storage flight_ = flights[flightId];
        flight_.statusCode = _statusCode;
        flight_.updatedTimestamp = _timestamp;
    }


    uint32 testIndex;
    address testAirline;
    string testFlight;
    uint256 testDate;
    uint256 testTimestamp;

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
    (
        address     _airline,
        string      _flight,
        uint256     _date,
        uint256     _timestamp
    )
    external
    {
        bytes32 flightId = getFlightKey(_airline, _flight, _date);
        require(flights[flightId].exists == true, ERROR_FLIGHT_NOT_ENLISTED);
        uint32 index_ = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index_, _airline, _flight, _date, _timestamp));
        oracleResponses[key] = ResponseInfo({requester: msg.sender, isOpen: true});

        emit OracleRequest(index_, _airline, _flight, _date, _timestamp);
        testIndex = index_;
        testAirline = _airline;
        testFlight = _flight;
        testDate = _date;
        testTimestamp = _timestamp;
    }

    function hasQuorum()  public view returns(bool hasQuorum_){
        hasQuorum_ = registered >= quorum;
    }

    function fetchAirlinesSummary() public view returns
    (
        uint256     registered_,
        uint256     registrationQueue_,
        uint256     quorum_,
        uint256     consensusPercentage_,
        uint256     consensus_
    )
    {
        registered_ = registered;
        registrationQueue_ = registrationQueue;
        quorum_ = quorum;
        consensusPercentage_ = consensusPercentage;
        consensus_ = consensus;
    }

    function fetchAirlineSummary(address _airlineAddress) public requireAirlineExist(_airlineAddress) view returns
    (
        uint256     votes_,
        bool        isRegistered_,
        uint256     contribution_
    )
    {
        Airline storage airline_ = airlines[_airlineAddress];
        votes_ = airline_.votes;
        isRegistered_ = airline_.isRegistered;
        contribution_ = airline_.contribution;
    }

    function fetchFlightSummary(bytes32 _flightId)
    public
    requireFlightExist(_flightId)
    view returns
    (
        bytes32     Id_,
        address     airline_,
        string      flightNumber_,
        uint256     date_,
        bool        isRegistered_,
        uint8       statusCode_,
        uint256     updatedTimestamp_,
        uint256     votes_,
        bool        canBeInsured_,
        uint256     policyCount_,
        bool        paidoutClaims_
    )
    {
        Flight storage flight_ = flights[_flightId];
        Id_ = flight_.Id;
        airline_ = flight_.airline;
        flightNumber_ = flight_.flightNumber;
        date_ = flight_.date;
        isRegistered_ = flight_.isRegistered;
        statusCode_ = flight_.statusCode;
        updatedTimestamp_ = flight_.updatedTimestamp;
        votes_ = flight_.votes;
        canBeInsured_ = flight_.canBeInsured;
        policyCount_ = flight_.policyCount;
        paidoutClaims_ = flight_.paidoutClaims;
    }

    function fetchPolicySummary(bytes32 _policyId)
    public
    requirePolicyExist(_policyId)
    view returns
    (
        bytes32  Id_,
        address  insured_,
        string   ticketNumber_,
        bytes32  flightId_,
        uint256  premium_,
        uint256  payout_,
        bool     isActive_,
        bool     isWithdrawn_
    )
    {
        Policy storage policy_ = policies[_policyId];
        Id_ = policy_.Id;
        insured_ = policy_.insured;
        ticketNumber_ = policy_.ticketNumber;
        flightId_ = policy_.flightId;
        premium_ = policy_.premium;
        payout_ = policy_.payout;
        isActive_ = policy_.isActive;
        isWithdrawn_ = policy_.isWithdrawn;
    }


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint32[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 date, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 date, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint32 index, address airline, string flight, uint256 date, uint256 timestamp);

    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint32[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: indexes
        });
    }

    function getMyIndexes
                            (
                            )
                            external
                            view
                            returns(uint32[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
    (
        uint32 _index,
        address airline,
        string flight,
        uint256 date,
        uint256 timestamp,
        uint8 statusCode
    )
    external
    {
        require((oracles[msg.sender].indexes[0] == _index) || (oracles[msg.sender].indexes[1] == _index) || (oracles[msg.sender].indexes[2] == _index), "Index does not match oracle request");

        bytes32 key = keccak256(abi.encodePacked(_index, airline, flight, date, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, date, timestamp,  statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, date, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, date, timestamp, statusCode);
        }
    }



    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
    (
        address account
    )
    internal
    returns(uint32[3])
    {
        uint32[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
    (
        address account
    )
    internal
    returns (uint32)
    {
        uint32 maxValue = 5;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}
