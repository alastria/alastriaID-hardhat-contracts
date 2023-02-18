// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./AlastriaNameService.sol";

contract AlastriaNameRegistry {
    AlastriaNameService ans;
    bytes32 rootNode;
    mapping (address => bytes32) serviceProviderRootNodes;
    mapping (address => bytes32[]) serviceProviderClaimedNodes;

    constructor (address ansAddr, bytes32 node) {
        ans = AlastriaNameService(ansAddr);
        rootNode = node;
    }

    function register(bytes32 subnode, address owner) public {
      bytes32 spRootNode = serviceProviderRootNodes[msg.sender];
      bytes32 node = keccak256(abi.encode(spRootNode, subnode));
      serviceProviderClaimedNodes[msg.sender].push(node);
      address currentOwner = ans.owner(node);
      if(currentOwner != address(0) && currentOwner != msg.sender)
          revert();

      ans.setSubnodeOwner(spRootNode, subnode, owner);
    }

    function registerServiceProvider(bytes32 spRootNode, address owner) public {
        bytes32 node = keccak256(abi.encode(rootNode, spRootNode));
        address currentOwner = ans.owner(node);
        if(currentOwner != address(0) && currentOwner != msg.sender)
            revert();

        ans.setSubnodeOwner(rootNode, spRootNode, owner);
    }

    function unregister(bytes32 subnode) public {
      bytes32 spRootNode = serviceProviderRootNodes[msg.sender];
      bytes32 node = keccak256(abi.encode(spRootNode, subnode));
      address currentOwner = ans.owner(node);
      if(currentOwner != msg.sender)
          revert();
      ans.setSubnodeOwner(spRootNode, subnode, address(0));
    }
}