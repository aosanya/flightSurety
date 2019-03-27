pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Accesscontrol.sol";

contract FlightSuretyData is AccessControl{
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    uint256 consensus = 0;

    /********************************************************************************************/
    /*                                       SETTINGS                                           */
    /********************************************************************************************/
    uint256 constant quorum = 4;
    uint256 constant minimumContribution = 10 ether;
    uint256 constant consensusPercentage = 50;
    uint256 constant maximumPremium = 1 ether;

    /********************************************************************************************/
    /*                                       ERROR CODES                                        */
    /********************************************************************************************/
    string private constant ERROR_NO_QUORUM = "ERROR_NO_QUORUM";
    string private constant ERROR_AIRLINE_NOT_ENLISTED = "ERROR_AIRLINE_NOT_ENLISTED";
    string private constant ERROR_AIRLINE_ALREADY_ENLISTED = "ERROR_AIRLINE_ALREADY_ENLISTED";
    string private constant ERROR_AIRLINE_IS_NOT_REGISTERED = "ERROR_AIRLINE_IS_NOT_REGISTERED";
    string private constant ERROR_AIRLINE_IS_ALREADY_REGISTERED = "ERROR_AIRLINE_IS_ALREADY_REGISTERED";

    string internal constant ERROR_FLIGHT_NOT_ENLISTED = "ERROR_FLIGHT_NOT_ENLISTED";
    string private constant ERROR_FLIGHT_ALREADY_ENLISTED = "ERROR_FLIGHT_ALREADY_ENLISTED";

    string private constant ERROR_FLIGHT_CANNOT_BE_INSURED = "ERROR_FLIGHT_CANNOT_BE_INSURED";
    string private constant ERROR_MAXIMUM_PREMIUM_PAID = "ERROR_MAXIMUM_PREMIUM_PAID";

    string private constant ERROR_PURCHASE_VALUE_IS_0 = "ERROR_PURCHASE_VALUE_IS_0";
    string private constant ERROR_POLICY_DOES_NOT_EXIST = "ERROR_POLICY_DOES_NOT_EXIST";
    string internal constant ERROR_POLICY_CANNOT_CLAIM = "ERROR_POLICY_CANNOT_CLAIM";
    string private constant ERROR_ALREADY_PAIDOUT_CLAIM = "ERROR_ALREADY_PAIDOUT_CLAIM";
    string internal constant ERROR_ALREADY_PAIDOUT_CLAIMS = "ERROR_ALREADY_PAIDOUT_CLAIMS";
    string internal constant ERROR_POLICY_HAS_NO_PAYOUT = "ERROR_POLICY_HAS_NO_PAYOUT";
    string internal constant ERROR_NOT_POLICY_OWNER = "ERROR_NOT_POLICY_OWNER";

    string internal constant ERROR_CLAIM_IS_ALREADY_WITHDRAWN = "ERROR_CLAIM_IS_ALREADY_WITHDRAWN";

    string private constant ERROR_CALLER_NOT_CONTRACT_OWNER = "ERROR_CALLER_NOT_CONTRACT_OWNER";
    string private constant ERROR_AIRLINE_ALREADY_VOTED_FOR_AIRLINE = "ERROR_AIRLINE_HAS_ALREADY_VOTED_FOR_THIS_AIRLINE";

    string private constant ERROR_FLIGHT_IS_NOT_REGISTERED = "ERROR_FLIGHT_IS_NOT_REGISTERED";
    string private constant ERROR_FLIGHT_IS_ALREADY_REGISTERED = "ERROR_FLIGHT_IS_ALREADY_REGISTERED";
    string private constant ERROR_AIRLINE_ALREADY_VOTED_FOR_FLIGHT = "ERROR_AIRLINE_HAS_ALREADY_VOTED_FOR_THIS_FLIGHT";



    struct Airline {
        address id;
        uint256 votes;
        mapping (address => bool) votedBy;
        bool isRegistered;
        uint256 contribution;
        bool exists;
    }
    mapping (address => Airline) internal airlines;
    uint256 registered;
    uint256 registrationQueue;

    struct Flight {
        bytes32     Id;
        address     airline;
        string      flightNumber;
        uint256     date;
        bool        isRegistered;
        uint8       statusCode;
        uint256     updatedTimestamp;
        uint256     votes;
        bool        canBeInsured;
        mapping     (address => bool) votedBy;
        mapping     (uint256 => bytes32) policies;
        uint256     policyCount;
        bool        paidoutClaims;
        bool        exists;
    }
    mapping(bytes32 => Flight) internal flights;

    struct Policy {
        bytes32  Id;
        address  insured;
        string   ticketNumber;
        bytes32  flightId;
        uint256  premium;
        uint256  payout;
        bool     isActive;
        bool     isWithdrawn;
        bool     exists;
    }
    mapping(bytes32 => Policy) internal policies;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public {
        contractOwner = msg.sender;
        Airline storage airline_ = addAirline(msg.sender);
        incorporateAirline(airline_);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/
    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireHasQuorum()
    {
        require(hasQuorum() == true, ERROR_NO_QUORUM);
        _;
    }

    modifier requireAirlineExist(address _who)
    {
        require(airlines[_who].exists == true, ERROR_AIRLINE_NOT_ENLISTED);
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    modifier requireAirlineNotExist(address _who)
    {
        require(airlines[_who].exists == false, ERROR_AIRLINE_ALREADY_ENLISTED);
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

    modifier requireFlightExist(
        bytes32      _flightId
    )
    {
        require(flights[_flightId].exists == true, ERROR_FLIGHT_NOT_ENLISTED);
        _;
    }

    modifier canRegisterAirline() {
        require(has(AIRLINE_REGISTRATION_ROLE, msg.sender, ""), ERROR_MISSING_AIRLINE_REGISTRATION_PERMISSION);
        _;
    }

    modifier canRegisterFlight() {
        require(has(FLIGHT_REGISTRATION_ROLE, msg.sender, ""), ERROR_MISSING_FLIGHT_REGISTRATION_PERMISSION);
        _;
    }

    modifier requireFlightNotExist(
        bytes32      _flightId
    )
    {
        require(flights[_flightId].exists == false, ERROR_FLIGHT_NOT_ENLISTED);
        _;
    }


    modifier requireFlightCanBeInsured(bytes32 _flightId)
    {
        Flight storage flight_ = flights[_flightId];
        require(flight_.canBeInsured == true, ERROR_FLIGHT_CANNOT_BE_INSURED);
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

    modifier requirePolicyExist(
        bytes32      _policyId
    )
    {
        require(policies[_policyId].exists == true, ERROR_POLICY_DOES_NOT_EXIST);
        _;
    }

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return operational;
    }

    function hasQuorum()  public view returns(bool hasQuorum_){
        hasQuorum_ = registered >= quorum;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode)
                            external
                            requireContractOwner
    {
        operational = mode;
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

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function addAirline(address _who)
        internal
        requireAirlineNotExist(_who)
        returns(Airline storage airline_)
    {
        airline_ = airlines[_who];
        airline_.id = _who;
        airline_.votes = 0;
        airline_.isRegistered = false;
        airline_.exists = true;
        registrationQueue += 1;
        return airline_;
    }

    function addFlight(
        address     _airline,
        string      _flightNumber,
        uint256     _date,
        uint8       _statusCode
    )
        internal
        requireAirlineExist(_airline)
        returns(Flight storage flight_)
    {
        bytes32 flightId = getFlightKey(_airline, _flightNumber, _date);
        flight_ = flights[flightId];
        flight_.Id = flightId;
        flight_.flightNumber = _flightNumber;
        flight_.date = _date;
        flight_.statusCode = _statusCode;
        flight_.isRegistered = false;
        flight_.airline = _airline;
        flight_.exists = true;
        flight_.canBeInsured = true;
        flight_.paidoutClaims = false;
        return flight_;
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
            flight_ = addFlight(_airline, _flight, _date, 0); // 0 is status code unknown
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
    * @dev Buy insurance for a flight
    *
    */
    function buy(
        bytes32  _flightId,
        string   _ticketNumber
    )
        public
        requireFlightCanBeInsured(_flightId)
        payable
    {
        require(msg.value > 0, ERROR_PURCHASE_VALUE_IS_0);
        bytes32 key = getPolicyKey(_flightId, _ticketNumber);
        Policy storage policy_ = policies[key];
        require(policy_.premium < maximumPremium, ERROR_MAXIMUM_PREMIUM_PAID);
        uint256 maxPayablePremium = maximumPremium - policy_.premium;

        policy_.Id = key;
        policy_.ticketNumber = _ticketNumber;
        policy_.flightId = _flightId;
        policy_.insured = msg.sender;
        if (msg.value > maxPayablePremium){
            policy_.premium += maxPayablePremium;
            msg.sender.transfer(msg.value - maxPayablePremium); //refund excess
        }
        else{
            policy_.premium += msg.value;
        }
        policy_.payout = 0;
        policy_.isActive = false;
        policy_.isWithdrawn = false;

        if (policy_.exists == false){
            Flight storage flight_ = flights[_flightId];
            flight_.policies[flight_.policyCount + 1] = key;
            flight_.policyCount++;
        }

        policy_.exists = true;
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

    function creditInsuree
    (
        bytes32  _policyId
    )
    internal
    {
        Policy storage policy_ = policies[_policyId];
        require(policy_.exists, ERROR_POLICY_DOES_NOT_EXIST);
        require(policy_.payout == 0, ERROR_ALREADY_PAIDOUT_CLAIM);
        policy_.payout = policy_.premium.mul(3).div(2);
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

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
    (
        bytes32  _policyId
    )
        external
    {
        Policy storage policy_ = policies[_policyId];
        require(policy_.exists, ERROR_POLICY_DOES_NOT_EXIST);
        require(policy_.insured == msg.sender, ERROR_NOT_POLICY_OWNER);
        require(policy_.payout > 0, ERROR_POLICY_HAS_NO_PAYOUT);
        require(policy_.isWithdrawn == false, ERROR_CLAIM_IS_ALREADY_WITHDRAWN);
        policy_.isWithdrawn = true;
        msg.sender.transfer(policy_.payout);

    }


    function contribute
                            (
                            )
                            internal
    {
        Airline storage airline_ = airlines[msg.sender];
        airline_.contribution += msg.value;
    }

    function getFlightKey
    (
        address airline,
        string memory flight,
        uint256 date
    )
    public
    pure
    returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, date));
    }

    function getPolicyKey
    (
        bytes32 flightId,
        string  ticketNumber
    )
    public
    pure
    returns(bytes32)
    {
        return keccak256(abi.encodePacked(flightId, ticketNumber));
    }

    function isAirline(address _who)
                            public
                            view
                            returns(bool)
    {
        return airlines[_who].exists;
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
        bytes32 flightId_ = getFlightKey(_airline, _flight, _date);
        return flights[flightId_].isRegistered;
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

    /********************************************************************************************/
    /*                                       Fetch Summaries                                    */
    /********************************************************************************************/
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

}

