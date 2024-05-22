// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../libs/Eidas.sol";

contract AlastriaIdentityServiceProvider {

    using Eidas for Eidas.EidasLevel;

    mapping(address => bool) internal providers;

    modifier onlyIdentityServiceProvider(address _identityServiceProvider) {
        require (isIdentityServiceProvider(_identityServiceProvider));
        _;
    }

    modifier notIdentityServiceProvider(address _identityServiceProvider) {
        require (!isIdentityServiceProvider(_identityServiceProvider));
        _;
    }

    function _initializeIdentityServiceProvider(address _firstIdentity) internal {
        providers[_firstIdentity] = true;
    }

    function addIdentityServiceProvider(address _identityServiceProvider) public onlyIdentityServiceProvider(msg.sender) notIdentityServiceProvider(_identityServiceProvider) {
        providers[_identityServiceProvider] = true;
    }

    function deleteIdentityServiceProvider(address _identityServiceProvider) public onlyIdentityServiceProvider(_identityServiceProvider) onlyIdentityServiceProvider(msg.sender) {
        providers[_identityServiceProvider] = false;
    }

    function isIdentityServiceProvider(address _identityServiceProvider) public view returns (bool) {
        return providers[_identityServiceProvider];
    }

}

