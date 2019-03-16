pragma solidity ^0.4.24;

// Define a contract 'Supplychain'
contract AccessControl{
    mapping (bytes32 => bool) internal roles;
    mapping (bytes32 => bool) internal permissions;

    string private constant ERROR_MISSING_AIRLINE_REGISTRATION_PERMISSION = "ERROR_MISSING_AIRLINE_REGISTRATION_PERMISSION";
    string private constant ERROR_MISSING_FLIGHT_REGISTRATION_PERMISSION = "ERROR_MISSING_FLIGHT_REGISTRATION_PERMISSION";
    string private constant ERROR_MISSING_CLAIMS_PAYOUT_ROLE = "ERROR_MISSING_CLAIMS_PAYOUT_ROLE";

    bytes32 public constant AIRLINE_REGISTRATION_ROLE = keccak256("AIRLINE_REGISTRATION_ROLE");
    bytes32 public constant FLIGHT_REGISTRATION_ROLE = keccak256("FLIGHT_REGISTRATION_ROLE");
    bytes32 public constant CLAIMS_PAYOUT_ROLE = keccak256("CLAIMS_PAYOUT_ROLE");

    modifier canRegisterAirline() {
        require(has(AIRLINE_REGISTRATION_ROLE, msg.sender, ""), ERROR_MISSING_AIRLINE_REGISTRATION_PERMISSION);
        _;
    }

    modifier canRegisterFlight() {
        require(has(FLIGHT_REGISTRATION_ROLE, msg.sender, ""), ERROR_MISSING_FLIGHT_REGISTRATION_PERMISSION);
        _;
    }

    modifier canPayoutClaims() {
        require(has(CLAIMS_PAYOUT_ROLE, msg.sender, ""), ERROR_MISSING_CLAIMS_PAYOUT_ROLE);
        _;
    }

    constructor() public {
        addRole(AIRLINE_REGISTRATION_ROLE);
        addRole(FLIGHT_REGISTRATION_ROLE);
        addRole(CLAIMS_PAYOUT_ROLE);
    }

    function roleHash(bytes32 _role) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("ROLE", _role));
    }

    function permissionHash(address _who, bytes32 _role, bytes32 _for) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("PERMISSION", _who, _role, _for));
    }

    function addRole(bytes32 _role) internal {
        bytes32 thisRoleHash = roleHash(_role);
        require(roles[thisRoleHash] == false, "Role Already Exists");
        roles[thisRoleHash] = true;
    }

    function addPermission(bytes32 _role, address _who, bytes32 _for) internal {
        bytes32 thisRoleHash = roleHash(_role);
        require(roles[thisRoleHash] == true, "Role Does Not Exists");
        bytes32 thisPermissionHash = permissionHash(_who, _role, _for);
        require(permissions[thisPermissionHash] == false, "Permission Already Exists");
        permissions[thisPermissionHash] = true;
    }

    modifier hasPermission(bytes32 _role, address _who, bytes32 _for, string _message){
        require(has(_role, _who, _for), _message);
        _;
    }

    /**
    * @dev check if an account has this role
    * @return bool
    */
    function has(bytes32 _role, address _who, bytes32 _for)
      internal
      view
      returns (bool)
    {
        //require(_who != address(0), "Cannot check address of contract owner");
        bytes32 thisPermissionHash = permissionHash(_who, _role, _for);
        return permissions[thisPermissionHash];
    }

}