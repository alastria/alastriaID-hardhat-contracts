// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');

const password = 'Passw0rd';
const admin_keystore_file = '../accounts/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11';

const addresses = {};

async function saveAddresesInfo(address, contractName, network) {
  if (network === 'development') {
    return;
  }
  addresses[contractName] = address;
  console.log(`${contractName} address info saved!`);
}

async function initialize(credentialRegistry, presentationRegistry, publicKeyRegistry, identityManager) {
  const config = TruffleConfig.detect().env;

  try {
    console.log('Voy a petar');
    let tx = await credentialRegistry.initialize(
      '0x0000000000000000000000000000000000000001'
    );
    console.log(
      `Credential registry initilized in ${tx.receipt.transactionHash}`
    );

    tx = await presentationRegistry.initialize(
      '0x0000000000000000000000000000000000000001'
    );
    console.log(
      `Presentation registry initilized in ${tx.receipt.transactionHash}`
    );

    tx = await publicKeyRegistry.initialize(
      '0x0000000000000000000000000000000000000001'
    );
    console.log(
      `Public key registry initilized in ${tx.receipt.transactionHash}`
    );

    tx = await identityManager.initialize(
      addresses[config.credential],
      addresses[config.publicKey],
      addresses[config.presentation],
      config.firstIdentityWallet
    );
    console.log(`Identity manager initilized in ${tx.receipt.transactionHash}`);

  } catch (err) {
    console.log('ERROR:', err);
    callback(err, null);
  }

  console.log('Contracts initialized');
};

async function main() {
  const admin_keystore = fs.readFileSync(admin_keystore_file);
  const ADMIN_WALLET = new hre.ethers.Wallet.fromEncryptedJson(admin_keystore, password)
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
  const alastriaIdentityManagerProxy = await Proxy.deploy(alastriaIdentityManager.address, ADMIN_ADDRESS, []);
  await alastriaIdentityManagerProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaIdentityManagerProxy.address,
    ADMIN_WALLET.address,
    network
  );

  const alastriaCredentialRegistry = await AlastriaCredentialRegistry.deploy();
  await alastriaCredentialRegistry.deployed();
  const alastriaCredentialRegistryProxy = await Proxy.deploy(alastriaCredentialRegistry.address, ADMIN_ADDRESS, []);
  await alastriaCredentialRegistryProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaCredentialRegistryProxy.address,
    ADMIN_WALLET.address,
    network
  );

  const alastriaPresentationRegistry = await AlastriaPresentationRegistry.deploy();
  await alastriaPresentationRegistry.deployed();
  const alastriaPresentationRegistryProxy = await Proxy.deploy(alastriaPresentationRegistry.address, ADMIN_ADDRESS, []);
  await alastriaPresentationRegistryProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaPresentationRegistryProxy.address,
    ADMIN_WALLET.address,
    network
  );

  const alastriaPublicKeyRegistry = await AlastriaPublicKeyRegistry.deploy();
  await alastriaPublicKeyRegistry.deployed();
  const alastriaPublicKeyRegistryProxy = await Proxy.deploy(alastriaPublicKeyRegistry.address, ADMIN_ADDRESS, []);
  await alastriaPublicKeyRegistryProxy.deployed();
  console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
  await saveAddresesInfo(
    alastriaPublicKeyRegistryProxy.address,
    ADMIN_WALLET.address,
    network
  );

  await fs.writeFileSync('./addresses.json', JSON.stringify(addresses));
  await initialize(alastriaCredentialRegistryProxy, alastriaPresentationRegistryProxy, alastriaPublicKeyRegistryProxy, alastriaIdentityManagerProxy);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
