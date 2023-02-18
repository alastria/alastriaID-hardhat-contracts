// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../nameService/AlastriaNameRegistry.sol";

contract AlastriaIdentityServiceProvider {

  AlastriaNameRegistry public anr;

  mapping(address => bool) internal serviceProviders;

  modifier onlyIdentityServiceProvider(address _identityServiceProvider) {
      require (isIdentityServiceProvider(_identityServiceProvider));
      _;
  }

  modifier notIdentityServiceProvider(address _identityServiceProvider) {
      require (!isIdentityServiceProvider(_identityServiceProvider));
      _;
  }

  function _initialize(address _firstIdentity) internal {
      serviceProviders[_firstIdentity] = true;
  }

  function addIdentityServiceProvider(address _identityServiceProvider, bytes32 _spNode) 
  public onlyIdentityServiceProvider(msg.sender) notIdentityServiceProvider(_identityServiceProvider) {
    anr.registerServiceProvider(_spNode, _identityServiceProvider);
    serviceProviders[_identityServiceProvider] = true;
  }

  function deleteIdentityServiceProvider(address _identityServiceProvider) public onlyIdentityServiceProvider(_identityServiceProvider) onlyIdentityServiceProvider(msg.sender) {
      serviceProviders[_identityServiceProvider] = false;
  }

  function isIdentityServiceProvider(address _identityServiceProvider) public view returns (bool) {
      return serviceProviders[_identityServiceProvider];
  }

}
