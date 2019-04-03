pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
//contract FlightSuretyApp is FlightSuretyData {
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    FlightSuretyData flightSuretyData;
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

    string private constant ERROR_FLIGHT_NOT_ENLISTED = "ERROR_FLIGHT_NOT_ENLISTED";
    string private constant ERROR_FLIGHT_IS_NOT_REGISTERED = "ERROR_FLIGHT_IS_NOT_REGISTERED";
    string private constant ERROR_FLIGHT_IS_ALREADY_REGISTERED = "ERROR_FLIGHT_IS_ALREADY_REGISTERED";
    string private constant ERROR_AIRLINE_ALREADY_VOTED_FOR_FLIGHT = "ERROR_AIRLINE_HAS_ALREADY_VOTED_FOR_THIS_FLIGHT";


    address private contractOwner;          // Account used to deploy contract

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.


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



    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, ERROR_CALLER_NOT_CONTRACT_OWNER);
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor
    (
        address dataContract
    )
    public
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);
        flightSuretyData.registerFirstAirline(msg.sender);
        authorizeDataContract();
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational()
                            public
                            pure
                            returns(bool)
    {
        return true;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/


        /**
    * @dev Add an airline to the registration queue
    *
    */
    function registerAirline(
        address _airlineAddress)
        public
        returns(bool success, uint256 votes, uint256 pendingVotes)
    {
        return flightSuretyData.registerAirline(msg.sender, _airlineAddress);
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        flightSuretyData.fund.value(msg.value)(msg.sender);
    }

    function fund
    (
    )
    public
    payable
    {
        flightSuretyData.fund.value(msg.value)(msg.sender);
    }

    /********************************************************************************************/
    /*                                       Flight Functions                                   */
    /********************************************************************************************/

    function registerFlight(
        address     _airline,
        string      _flight,
        uint256     _date
    )
        public
        returns(bool success, uint256 votes, uint256 pendingVotes)
    {
        return flightSuretyData.registerFlight(msg.sender, _airline, _flight, _date);
    }

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
        bytes32 flightId_ = flightSuretyData.getFlightKey(_airline, _flight, _date);
        require(flightSuretyData.flightExist(flightId_), ERROR_FLIGHT_NOT_ENLISTED);
        uint32 index_ = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index_, _airline, _flight, _date, _timestamp));
        oracleResponses[key] = ResponseInfo({requester: msg.sender, isOpen: true});

        emit OracleRequest(index_, _airline, _flight, _date, _timestamp);
    }

    function hasQuorum()  public view returns(bool hasQuorum_){
        hasQuorum_ = flightSuretyData.registered() >= flightSuretyData.quorum();
    }


    function creditInsurees
    (
        bytes32  _flightId
    )
    external{
        return flightSuretyData.creditInsurees(msg.sender, _flightId);
    }

    /********************************************************************************************/
    /*                                       Fetch Summaries                                    */
    /********************************************************************************************/
    function fetchAirlinesSummary() public view returns
    (
        uint256     registered_,
        uint256     registrationQueue_,
        uint256     quorum_,
        uint256     consensusPercentage_,
        uint256     consensus_
    )
    {
        registered_ = flightSuretyData.registered();
        registrationQueue_ = flightSuretyData.registrationQueue();
        quorum_ = flightSuretyData.quorum();
        consensusPercentage_ = flightSuretyData.consensusPercentage();
        consensus_ = flightSuretyData.consensus();
    }

    function fetchAirlineSummary(address _airlineAddress)
    public
    view returns
    (
        uint256     votes_,
        bool        isRegistered_,
        uint256     contribution_
    )
    {
        return flightSuretyData.fetchAirlineSummary(_airlineAddress);
    }

    function fetchFlightSummary(bytes32 _flightId)
    public
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

        return flightSuretyData.fetchFlightSummary(_flightId);
    }

    function fetchPolicySummary(bytes32 _policyId)
    public
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
        return flightSuretyData.fetchPolicySummary(_policyId);
    }

    /********************************************************************************************/
    /*                                       Status Functions                                   */
    /********************************************************************************************/
    function isAirline(address _who)
                            public
                            view
                            returns(bool)
    {
        return flightSuretyData.isAirline(_who);
    }

    function isFlightRegistered(
        address         _airline,
        string memory   _flight,
        uint256         _date
    )
        public
        view
        returns(bool)
    {
        return flightSuretyData.isFlightRegistered(_airline, _flight, _date);
    }

    /********************************************************************************************/
    /*                                       Policy Functions                                   */
    /********************************************************************************************/

    function buy(
        bytes32  _flightId,
        string   _ticketNumber
    )
        public
        payable
    {
        return flightSuretyData.buy.value(msg.value)(msg.sender, _flightId, _ticketNumber);
    }

    function pay
    (
        bytes32  _policyId
    )
        external
    {
        return flightSuretyData.pay(msg.sender, _policyId);
    }

    /********************************************************************************************/
    /*                                       Key Generators                                     */
    /********************************************************************************************/

    function getFlightKey
    (
        address _airline,
        string memory _flight,
        uint256 _date
    )
    public
    view
    returns(bytes32)
    {
        return flightSuretyData.getFlightKey(_airline, _flight, _date);
    }

    function getPolicyKey
    (
        bytes32 _flightId,
        string  _ticketNumber
    )
    public
    view
    returns(bytes32)
    {
        return flightSuretyData.getPolicyKey(_flightId, _ticketNumber);
    }


function authorizeDataContract() internal{
    return flightSuretyData.authorizeContract(msg.sender);
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

    event OracleResponse(uint32 index, address airline, string flight, uint256 date, uint256 timestamp, uint8 status, string info);

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
        emit OracleResponse(_index, airline, flight, date, now, statusCode, "Response recieved");
        require((oracles[msg.sender].indexes[0] == _index) || (oracles[msg.sender].indexes[1] == _index) || (oracles[msg.sender].indexes[2] == _index), "Index does not match oracle request");
        emit OracleResponse(_index, airline, flight, date, now, statusCode, "Index matches");
        bytes32 key = keccak256(abi.encodePacked(_index, airline, flight, date, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");
        emit OracleResponse(_index, airline, flight, date, now, statusCode, "Response is valid");
        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, date, timestamp,  statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, date, timestamp, statusCode);

            // Handle flight status as appropriate
            flightSuretyData.processFlightStatus(airline, flight, date, timestamp, statusCode);
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

    function getSender
    ()
    public
    returns (address)
    {
        return msg.sender;
    }
    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
    (
        address account
    )
    internal
    returns (uint32)
    {
        uint32 maxValue = 7;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}

contract FlightSuretyData{
    uint256 public registered;
    uint256 public registrationQueue;
    uint256 public quorum;
    uint256 public consensus;
    uint256 public minimumContribution;
    uint256 public consensusPercentage;
    uint256 public maximumPremium;

    function authorizeContract(address _registrar) external;

    function registerFirstAirline(address _airlineAddress) external;

    function registerAirline(address _registrar, address _airlineAddress)
                            external
                            returns(bool success, uint256 votes, uint256 pendingVotes);

    function fund(address _caller) external
        payable;

    function getFlightKey
        (
        address airline,
        string memory flight,
        uint256 date
        )
        public
        pure
        returns(bytes32);

    function flightExist
        (
            bytes32  _flightId
        )
        public
        view
        returns(bool);

    function isAirline(address _who)
                            public
                            view
                            returns(bool);

    function isFlightRegistered(
        address         _airline,
        string memory   _flight,
        uint256         _date
    )
        public
        view
        returns(bool);

    function processFlightStatus
    (
        address         _airline,
        string          _flight,
        uint256         _date,
        uint256         _timestamp,
        uint8           _statusCode
    )
    external;

    function buy(
        address   _buyer,
        bytes32  _flightId,
        string   _ticketNumber
    )
        public
        payable;

    function pay
    (
        address  _payee,
        bytes32  _policyId
    )
        external;

    function fetchAirlineSummary(address _airlineAddress) public view returns
        (
            uint256     votes_,
            bool        isRegistered_,
            uint256     contribution_
        );

    function fetchFlightSummary(bytes32 _flightId)
    public
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
        );

    function fetchPolicySummary(bytes32 _policyId)
    public
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
        );

    function registerFlight(
        address     _registrar,
        address     _airline,
        string      _flight,
        uint256     _date
    )
        public
        returns(bool success, uint256 votes, uint256 pendingVotes);

    function creditInsurees
    (
        address  _caller,
        bytes32  _flightId
    )
    external;

    function getPolicyKey
    (
        bytes32 flightId,
        string  ticketNumber
    )
        public
        pure
        returns(bytes32);
}