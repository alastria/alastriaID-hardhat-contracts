// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../openzeppelin/Initializable.sol";

contract AlastriaPublicKeyRegistry is Initializable{

    /*Major updates in V2.2.

    - addPublicKey is a new function for registry a new public key through its hash,  in addition 
      the automatic revocation has been eliminated, now the user must do it.
    - revokePublicKey and deletePublicKey function can be called from the public key and through the hash of the public key.
    - PublicKeyRevoked and PublicKeyDeleted events can be called from the public key and through the hash of the public key.
    */

    // This contracts registers and makes publicly avalaible the AlastriaID Public Keys hash and status, current and past.

    //To Do: Should we add RevokedBySubject Status?

    //Variables
    int public version;
    address public previousPublishedVersion;

    // Initially Valid: could only be changed to DeletedBySubject for the time being.
    enum Status {Valid, DeletedBySubject}
    struct PublicKey {
        bool exists;
        Status status; // Deleted keys shouldnt be used, not even to check previous signatures.
        uint startDate;
        uint endDate;
    }

    // Mapping (subject, publickey)
    mapping(address => mapping(bytes32 => PublicKey)) private publicKeyRegistry;
    // mapping subject => publickey
    mapping(address => string[]) public publicKeyList;

    //Events, just for revocation and deletion
    event PublicKeyDeleted (string publicKey);
    event PublicKeyRevoked (string publicKey);
    event PublicKeyRevoked (bytes32 publicKeyHash);
    event PublicKeyDeleted (bytes32 publicKeyHash);

    //Modifiers
    modifier validAddress(address addr) {//protects against some weird attacks
        require(addr != address(0));
        _;
    }

    function initialize(address _previousPublishedVersion) initializer public{
        version = 4;
        previousPublishedVersion = _previousPublishedVersion;
    }

    // Sets new key and revokes previous
    // THIS METHOD WILL BE DEPREATED
    function addKey(string memory publicKey) public {
        require(!publicKeyRegistry[msg.sender][getKeyHash(publicKey)].exists);
        uint changeDate = block.timestamp;
        revokePublicKey(getCurrentPublicKey(msg.sender));
        publicKeyRegistry[msg.sender][getKeyHash(publicKey)] = PublicKey(
            true,
            Status.Valid,
            changeDate,
            0
        );
        publicKeyList[msg.sender].push(publicKey);
    }

    function addPublicKey(bytes32 publicKeyHash) public {
        require(!publicKeyRegistry[msg.sender][publicKeyHash].exists);
        uint changeDate = block.timestamp;
        publicKeyRegistry[msg.sender][publicKeyHash] = PublicKey(
            true, 
            Status.Valid,
            changeDate,
            0
        );
    }

    // THIS METHOD WILL BE DEPREATED
    function revokePublicKey(string memory publicKey) public {
        PublicKey storage value = publicKeyRegistry[msg.sender][getKeyHash(publicKey)];
        // only existent no backtransition
        if (value.exists && value.status != Status.DeletedBySubject) {
            value.endDate = block.timestamp;
            emit PublicKeyRevoked(publicKey);
        }
    }

    function revokePublicKey(bytes32 publicKeyHash) public {
        PublicKey storage value = publicKeyRegistry[msg.sender][publicKeyHash];
        if (value.exists && value.status != Status.DeletedBySubject) {
            value.endDate = block.timestamp;
            emit PublicKeyRevoked(publicKeyHash);
        }
    }

    // THIS METHOD WILL BE DEPREATED
    function deletePublicKey(string memory publicKey) public {
        PublicKey storage value = publicKeyRegistry[msg.sender][getKeyHash(publicKey)];
        // only existent
        if (value.exists) {
            value.status = Status.DeletedBySubject;
            value.endDate = block.timestamp;
            emit PublicKeyDeleted(publicKey);
        }
    }

    function deletePublicKey(bytes32 publicKeyHash) public {
        PublicKey storage value = publicKeyRegistry[msg.sender][publicKeyHash];
        if (value.exists) {
            value.status = Status.DeletedBySubject;
            value.endDate = block.timestamp;
            emit PublicKeyDeleted(publicKeyHash);
        }
    }

    // THIS METHOD WILL BE DEPREATED
    function getCurrentPublicKey(address subject) view public validAddress(subject) returns (string memory) {
        if (publicKeyList[subject].length > 0) {
            return publicKeyList[subject][publicKeyList[subject].length - 1];
        } else {
            return "";
        }
    }

    function getPublicKeyStatus(address subject, bytes32 publicKeyHash) view public validAddress(subject)
        returns (bool exists, Status status, uint startDate, uint endDate){
        require(publicKeyRegistry[msg.sender][publicKeyHash].exists, "Public Key not exists");
        PublicKey storage value = publicKeyRegistry[subject][publicKeyHash];
        return (value.exists, value.status, value.startDate, value.endDate);
    }
    
    // THIS METHOD WILL BE DEPREATED
    function getKeyHash(string memory inputKey) internal pure returns(bytes32){
        return keccak256(abi.encodePacked(inputKey));
    }

}