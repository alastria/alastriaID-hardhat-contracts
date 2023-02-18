// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../libs/SafeMath.sol";

contract AlastriaPublicKeyRegistry {
  using SafeMath for uint256;
  enum STATUS {Deleted, Alive}
  enum FORMAT {JWK, PEM, DER, RAW}
  
  // Public key struct for data
  // the public MUST be in an accepted standard like JWK, PEM or DER
  struct PublicKey {
    STATUS status;
    string publicKey;
    FORMAT format;
    uint startDate;
    uint endDate;
  }
  
  // Mapping identity to Key ID keccak256(publicKey) to publickey data
  mapping(address => mapping(bytes32 => PublicKey)) public publicKeyRegistry;
  // Mapping subject => keyIndex => keyHash
  mapping(address => mapping(uint256 => bytes32)) public publicKeyList;
  // Mapping subjst => currentIndex
  mapping(address => uint256) public currentIndexes;

  // Events, just for revocation and deletion
  event PublicKeyDeleted (string publicKey, bytes32 id);

// Modifiers
  modifier validAddress(address addr) {//protects against some weird attacks
      require(addr != address(0));
      _;
  }

  /**
   * @dev Sets new key and revokes previous
   */
  function addPublicKey(string memory publicKey, FORMAT format) public
  {
      uint256 currentIndex = currentIndexes[msg.sender];
      revokePublicKey(publicKeyList[msg.sender][currentIndex]);
      publicKeyRegistry[msg.sender][getKeyHash(publicKey)] = PublicKey(
          STATUS.Alive,
          publicKey,
          format,
          block.timestamp,
          0
      );
      currentIndexes[msg.sender] = currentIndex.add(1);
      publicKeyList[msg.sender][currentIndex.add(1)] = getKeyHash(publicKey);
  }

  /**
  * @dev Revoke a public key published, if none is added, the identity will be invalidated
  */
  function revokePublicKey(bytes32 publicKeyId) public
  {
      PublicKey storage publicKey = publicKeyRegistry[msg.sender][publicKeyId];
      // only existent no backtransition
      if (publicKey.endDate == 0 && publicKey.status != STATUS.Deleted) {
          publicKey.endDate = block.timestamp;
          publicKey.status = STATUS.Deleted;
          emit PublicKeyDeleted(publicKey.publicKey, publicKeyId);
      }
  }

  /**
  * @dev Gets the last public added to an identity
  * @param subject of the key
  */
  function getCurrentPublicKey(address subject) view public validAddress(subject) returns (string memory, FORMAT)
  {
    PublicKey storage publicKey = publicKeyRegistry[subject][publicKeyList[subject][currentIndexes[subject]]];
    return (publicKey.publicKey, publicKey.format);
  }

  /**
  * @dev Get the status from a given identity and a public key
  * @param subject key owner
  * @param publicKey data payload
  */
  function getPublicKeyStatus(address subject, string memory publicKey) view public validAddress(subject)
  returns (STATUS status, uint startDate, uint endDate)
  {
      PublicKey storage value = publicKeyRegistry[subject][getKeyHash(publicKey)];
      return (value.status, value.startDate, value.endDate);
  }

  /**
  * @dev Returns de hash of an input key as string to generate a bytes32 index
  */
  function getKeyHash(string memory inputKey) internal pure returns(bytes32){
      return keccak256(abi.encodePacked(inputKey));
  }
}