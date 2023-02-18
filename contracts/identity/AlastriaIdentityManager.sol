// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../access/Ownable.sol";
// import "../proxy/utils/Initializable.sol";
import "../registries/AlastriaPublicKeyRegistry.sol";
import "./AlastriaIdentityServiceProvider.sol";
import "./AlastriaProxy.sol";

contract AlastriaIdentityManager is Ownable, AlastriaIdentityServiceProvider {

    //Variables
    uint256 constant internal timeToLive = 10000;
    AlastriaPublicKeyRegistry public alastriaPublicKeyRegistry;
    address public identityManagerAdmin; 
    mapping(address => address) public DID; //change to alastriaID created check bool
    mapping(address => uint) public pendingIDs;
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    //Events
    event PreparedAlastriaID(address indexed signAddress);

    event OperationWasNotSupported(string indexed method);

    event IdentityCreated(address indexed identity, address indexed creator, address owner);

    event IdentityRecovered(address indexed oldAccount, address newAccount, address indexed serviceProvider);

    //Modifiers
    modifier isPendingAndOnTime(address _signAddress) {
        require(pendingIDs[_signAddress] > 0 && pendingIDs[_signAddress] > block.timestamp);
        _;
    }

    modifier validAddress(address addr) { //protects against some weird attacks
        require(addr != address(0));
        _;
    }

    /**
    * @dev Identity admin is the first identity generated on the contract, that can only manage identity roles, not credentials, presentations or presentation request
    */
    modifier onlyIdentityAdmin(address addr) { 
        require(addr == identityManagerAdmin);
        _;
    }

    //Constructor
    // function initialize (address _credentialRegistry, address _publicKeyRegistry, address _presentationRegistry, address _firstIdentityWallet) public initializer {
    //     alastriaCredentialRegistry = AlastriaCredentialRegistry(_credentialRegistry);
    //     alastriaPresentationRegistry = AlastriaPresentationRegistry(_presentationRegistry);
    //     alastriaPublicKeyRegistry = AlastriaPublicKeyRegistry(_publicKeyRegistry);
    //     AlastriaProxy identity = new AlastriaProxy();
    //     identityKeys[_firstIdentityWallet] = address(identity);
    //     firstIdentityWallet = address(identity);
    //     AlastriaIdentityServiceProvider._initialize(address(identity));
    //     AlastriaIdentityIssuer._initialize(address(identity));
    // }

    //Methods
    /**
    * @dev Generate the Access Token for Alastria Identity
    * @param _signAddress the address which will have the access token
    */
    function prepareAlastriaID(address _signAddress) public onlyIdentityServiceProvider(msg.sender) {
        pendingIDs[_signAddress] = block.timestamp + timeToLive;
        emit PreparedAlastriaID(_signAddress);
    }
    
    /**
    * @dev Creates a new AlastriaProxy contract for an owner and recovery and allows an initial forward call which would be to set the registry in our case
    * @param addPublicKeyCallData of the call to addKey function in AlastriaPublicKeyRegistry from the new deployed AlastriaProxy contract
    */
    function createAlastriaIdentity(bytes memory addPublicKeyCallData) public validAddress(msg.sender) isPendingAndOnTime(msg.sender) {
        AlastriaProxy identity = new AlastriaProxy();
        DID[msg.sender] = address(identity);
        pendingIDs[msg.sender] = 0;
        identity.forward(address(alastriaPublicKeyRegistry), 0, addPublicKeyCallData);//must be alastria registry call
    }

   /**
    * @dev Creates a new AlastriaProxy contract for an owner and recovery and allows an initial forward call which would be to set the registry in our case
    * @param publicKey to be encoded in PublicKeyRegistry call from IdentityManager
    */
    function createAlastriaIdentity(string memory publicKey, uint256 format) public validAddress(msg.sender) isPendingAndOnTime(msg.sender) {
        AlastriaProxy identity = new AlastriaProxy();
        DID[msg.sender] = address(identity);
        pendingIDs[msg.sender] = 0;
        bytes memory addPublicKeyCallData = abi.encodeWithSignature("addPublicKey(string, uin256)", publicKey, format);
        identity.forward(address(alastriaPublicKeyRegistry), 0, addPublicKeyCallData);//must be alastria registry call
    }

  /**
    * @dev Creates a new AlastriaProxy contract for an owner and recovery and allows an initial forward call which would be to set the registry in our case
    * @param addPublicKeyCallData of the call to addKey function in AlastriaPublicKeyRegistry from the new deployed AlastriaProxy contract
    */
    // function createAlastriaIdentityOverERC721(address ercContract) public validAddress(ercContract) isPendingAndOnTime(ercContract) {
    //     IERC721 token = IERC721(ercContract);
    //     require(token.supportsInterface(_INTERFACE_ID_ERC721));
    //     require(DID[token.owner()] == msg.sender);
    //     DID[ercContract] = ercContract;
    //     pendingIDs[ercContract] = 0;
    // }


    /**
    * @dev This method send a transaction trough the proxy of the sender
    * @param _destination for the call
    * @param _value of ether sent
    * @param _data for the call
    */
    function delegateCall(
        address _destination,
        uint256 _value,
        bytes memory _data
    ) public returns(bytes memory) {
        require(DID[msg.sender] != address(0));
        AlastriaProxy identity = AlastriaProxy(address(DID[msg.sender]));
        bytes memory result = identity.forward(_destination, _value, _data);
        return result;
    }
}
