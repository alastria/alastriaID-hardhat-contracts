// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');

const addresses = {};

async function saveAddresesInfo(address, contractName, network) {
  if (network === 'development') {
    return;
  }
  addresses[contractName] = address;
  console.log(`${contractName} address info saved!`);
}

async function main() {

  const Eidas = await hre.ethers.getContractFactory("Eidas");
  // const AlastriaIdentityServiceProvider = await hre.ethers.getContractFactory("AlastriaIdentityServiceProvider");
  // const AlastriaIdentityIssuer = await hre.ethers.getContractFactory("AlastriaIdentityIssuer");
  const Proxy = await hre.ethers.getContractFactory("AdminUpgradeabilityProxy");
  const AlastriaIdentityManager = await hre.ethers.getContractFactory("AlastriaIdentityManager");
  const AlastriaCredentialRegistry = await hre.ethers.getContractFactory("AlastriaCredentialRegistry");
  const AlastriaPresentationRegistry = await hre.ethers.getContractFactory("AlastriaPresentationRegistry");
  const AlastriaPublicKeyRegistry = await hre.ethers.getContractFactory("AlastriaPublicKeyRegistry");


  const eidas = await Eidas.deploy();
  await eidas.deployed();

  const alastriaIdentityManager = await AlastriaIdentityManager.deploy();
  await alastriaIdentityManager.deployed();
  const alastriaIdentityManagerProxy = await Proxy.deploy();
  await alastriaIdentityManagerProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaIdentityManagerProxy.address,
    config.manager,
    network
  );

  const alastriaCredentialRegistry = await AlastriaCredentialRegistry.deploy();
  await alastriaCredentialRegistry.deployed();
  const alastriaCredentialRegistryProxy = await Proxy.deploy();
  await alastriaCredentialRegistryProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaCredentialRegistryProxy.address,
    config.manager,
    network
  );

  const alastriaPresentationRegistry = await AlastriaPresentationRegistry.deploy();
  await alastriaPresentationRegistry.deployed();
  const alastriaPresentationRegistryProxy = await Proxy.deploy();
  await alastriaPresentationRegistryProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaPresentationRegistryProxy.address,
    config.manager,
    network
  );

  const alastriaPublicKeyRegistry = await AlastriaPublicKeyRegistry.deploy();
  await alastriaPublicKeyRegistry.deployed();
  const alastriaPublicKeyRegistryProxy = await Proxy.deploy();
  await alastriaPublicKeyRegistryProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaPublicKeyRegistryProxy.address,
    config.manager,
    network
  );

  await fs.writeFileSync('./addresses.json', JSON.stringify(addresses));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
