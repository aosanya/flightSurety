pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    uint256 constant quorum = 4;
    uint256 constant minimumContribution = 10 ether;
    uint256 constant consensusPercentage = 50;
    uint256 consensus = 0;

    string private constant ERROR_AIRLINE_NOT_ENLISTED = "ERROR_AIRLINE_NOT_ENLISTED";
    string private constant ERROR_AIRLINE_ALREADY_ENLISTED = "ERROR_AIRLINE_ALREADY_ENLISTED";
    string private constant ERROR_AIRLINE_IS_NOT_REGISTERED = "ERROR_AIRLINE_IS_NOT_REGISTERED";
    string private constant ERROR_AIRLINE_IS_ALREADY_REGISTERED = "ERROR_AIRLINE_IS_ALREADY_REGISTERED";

    struct Airline {
        address id;
        uint256 votes;
        mapping (address => bool) votedBy;
        bool exists;
        bool isRegistered;
        uint256 contribution;
    }

    mapping (address => Airline) internal airlines;
    uint256 registered;
    uint256 registrationQueue;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;
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

    modifier requireIsRegistered(address _airlineAddress)
    {
        Airline storage airline_ = airlines[_airlineAddress];
        require(airline_.isRegistered == true, ERROR_AIRLINE_IS_NOT_REGISTERED);
        _;
    }

    modifier requireNotRegistered(address _airlineAddress)
    {
        Airline storage airline_ = airlines[_airlineAddress];
        require(airline_.isRegistered == false, ERROR_AIRLINE_IS_ALREADY_REGISTERED);
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

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                            (
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
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
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }



    function isAirline(address _who)
                            public
                            view
                            returns(bool)
    {
        return airlines[_who].exists;
    }


}

