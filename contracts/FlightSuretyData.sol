pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
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
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

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

    modifier requireFlightExist(
        bytes32      _flightId
    )
    {
        require(flights[_flightId].exists == true, ERROR_FLIGHT_NOT_ENLISTED);
        _;
    }

    modifier requireFlightNotExist(
        bytes32      _flightId
    )
    {
        require(flights[_flightId].exists == false, ERROR_FLIGHT_NOT_ENLISTED);
        _;
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

    modifier requireFlightCanBeInsured(bytes32 _flightId)
    {
        Flight storage flight_ = flights[_flightId];
        require(flight_.canBeInsured == true, ERROR_FLIGHT_CANNOT_BE_INSURED);
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

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
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
}

