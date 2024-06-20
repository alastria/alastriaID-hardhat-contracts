require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
const fs = require("fs");
const keythereum = require('keythereum');

const password = 'Passw0rd';
const adminPath = './accounts/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11';
const firstId = './accounts/serviceProvider-643266eb3105f4bf8b4f4fec50886e453f0da9ad'
const adminKey = keythereum.recover(password, JSON.parse(fs.readFileSync(adminPath, 'utf8'))).toString('hex');
const firstIdKey = keythereum.recover(password, JSON.parse(fs.readFileSync(firstId, 'utf8'))).toString('hex');

const localNode = "http://127.0.0.1:8545";
const tNetworkNode = "http://<redT-nodeIP>";
const bNetworkNode = "http://<redB-nodeIP>";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    local: {
      gasPrice: 0x0,
      accounts: [firstIdKey, adminKey],
      // One of: "byzantium", "constantinople", "petersburg", "istanbul", "muirGlacier", "berlin", "london", "arrowGlacier", "grayGlacier" and "merge". Default value: "merge"
      hardfork: "berlin",
      url: localNode
    },
    'red-b': {
      gasPrice: 0x0,
      accounts: [firstIdKey, adminKey],
      // One of: "byzantium", "constantinople", "petersburg", "istanbul", "muirGlacier", "berlin", "london", "arrowGlacier", "grayGlacier" and "merge". Default value: "merge"
      hardfork: "berlin",
      url: bNetworkNode
    },
    'red-t': {
      gasPrice: 0x0,
      accounts: [firstIdKey, adminKey],
      // One of: "byzantium", "constantinople", "petersburg", "istanbul", "muirGlacier", "berlin", "london", "arrowGlacier", "grayGlacier" and "merge". Default value: "merge"
      hardfork: "byzantium",
      url: tNetworkNode
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      // alastriaT uses "byzantium"
      // alastriaB uses "berlin"
      evmVersion: 'byzantium',
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './contracts'
  }
};