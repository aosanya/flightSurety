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
contract FlightSuretyApp is FlightSuretyData {
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
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund();
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

// contract FlightSuretyData{
//     struct Airline {
//         address id;
//         uint256 votes;
//         mapping (address => bool) votedBy;
//         bool isRegistered;
//         uint256 contribution;
//         bool exists;
//     }
// }