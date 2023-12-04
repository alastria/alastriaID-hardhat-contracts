// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');

const password = 'Passw0rd';
const admin_keystore_file = './accounts/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11';

const addresses = {};

const config = {
  firstIdentityWallet: "0x643266eb3105f4bf8b4f4fec50886e453f0da9ad",
  adminAccount: "0x6e3976aeaa3A59E4AF51783CC46EE0fFabC5DC11",
  manager: "AlastriaIdentityManager",
  nameService: "AlastriaNameService",
  presentation: "AlastriaPresentationRegistry",
  credential: "AlastriaCredentialRegistry",
  publicKey: "AlastriaPublicKeyRegistry",
  serviceProvider: "AlastriaServiceProvider",
  identityIssuer: "AlastriaIdentityIssuer",
  eidas: "Eidas"
};

async function saveAddresesInfo(address, contractName, network) {
  if (network === 'development') {
    return;
  }
  addresses[contractName] = address;
  console.log(`${contractName} address info saved!`);
}

async function initialize(credentialRegistry, presentationRegistry, publicKeyRegistry, identityManager) {

  const AlastriaIdentityManager = await hre.ethers.getContractFactory("AlastriaIdentityManager");
  const AlastriaCredentialRegistry = await hre.ethers.getContractFactory("AlastriaCredentialRegistry");
  const AlastriaPresentationRegistry = await hre.ethers.getContractFactory("AlastriaPresentationRegistry");
  const AlastriaPublicKeyRegistry = await hre.ethers.getContractFactory("AlastriaPublicKeyRegistry");
  try {
    console.log('Voy a petar');
    console.log("INITIALIZING CR")
    const proxifiedCredentialRegistry = await AlastriaCredentialRegistry.attach(credentialRegistry.address);
    let tx = await proxifiedCredentialRegistry.initialize(
      '0x0000000000000000000000000000000000000001'
    );
    let receipt = await tx.wait(2)
    console.log(
      `Credential registry initilized in ${JSON.stringify(receipt)}`
    );
    console.log("INITIALIZING PR")
    const proxifiedPresentationRegistry = await AlastriaPresentationRegistry.attach(presentationRegistry.address);
    tx = await proxifiedPresentationRegistry.initialize(
      '0x0000000000000000000000000000000000000001'
    );
    receipt = await tx.wait(2)
    console.log(
      `Presentation registry initilized in ${JSON.stringify(receipt)}`
    );
    console.log("INITIALIZING PKR")
    const proxifiedPublicKeyRegistry = await AlastriaPublicKeyRegistry.attach(publicKeyRegistry.address);
    tx = await proxifiedPublicKeyRegistry.initialize(
      '0x0000000000000000000000000000000000000001'
    );
    receipt = await tx.wait(2)
    console.log(
      `Public key registry initilized in ${JSON.stringify(receipt)}`
    );
    console.log("INITIALIZING IM")
    const proxifiedIdentityManager = await AlastriaIdentityManager.attach(identityManager.address);
    tx = await proxifiedIdentityManager.initialize(
      addresses[config.credential],
      addresses[config.publicKey],
      addresses[config.presentation],
      config.firstIdentityWallet
    );
    receipt = await tx.wait(2)
    console.log(`Identity manager initilized in ${JSON.stringify(receipt)}`);
    
  } catch (err) {
    console.log('ERROR:', err);
    callback(err, null);
  }
  
  console.log('Contracts initialized');
};

async function main() {
  console.log('INIT DEPLOY')
    const admin_keystore = fs.readFileSync(admin_keystore_file);
    console.log('SETTING UP ACCOUNT ADMIN')
    const ADMIN_WALLET = await new hre.ethers.Wallet.fromEncryptedJson(admin_keystore, password)
    const ADMIN_ADDRESS = ADMIN_WALLET.address
    console.log('GETTING FACTORIES')
    const Eidas = await hre.ethers.getContractFactory("Eidas");
    // const AlastriaIdentityServiceProvider = await hre.ethers.getContractFactory("AlastriaIdentityServiceProvider");
    // const AlastriaIdentityIssuer = await hre.ethers.getContractFactory("AlastriaIdentityIssuer");
    const Proxy = await hre.ethers.getContractFactory("AdminUpgradeabilityProxy");
    const AlastriaIdentityManager = await hre.ethers.getContractFactory("AlastriaIdentityManager");
    const AlastriaCredentialRegistry = await hre.ethers.getContractFactory("AlastriaCredentialRegistry");
    const AlastriaPresentationRegistry = await hre.ethers.getContractFactory("AlastriaPresentationRegistry");
    const AlastriaPublicKeyRegistry = await hre.ethers.getContractFactory("AlastriaPublicKeyRegistry");
    
    console.log('DEPLOYING CONTRACTS');
    const eidas = await Eidas.deploy();
    await eidas.deployed();
    console.log('DEPLOYING CONTRACTS: IDENTITY MANAGER');
    const alastriaIdentityManager = await AlastriaIdentityManager.deploy();
    await alastriaIdentityManager.deployed();
    console.log('and proxy')
    const alastriaIdentityManagerProxy = await Proxy.deploy(alastriaIdentityManager.address, ADMIN_ADDRESS, []);
    await alastriaIdentityManagerProxy.deployed();
    console.log('identityManager deployed: ', alastriaIdentityManagerProxy.address);
    await saveAddresesInfo(
      alastriaIdentityManagerProxy.address,
      config.manager,
      network
      );
    console.log('DEPLOYING CONTRACTS: CREDENTIAL REGISTRY');
    const alastriaCredentialRegistry = await AlastriaCredentialRegistry.deploy();
    await alastriaCredentialRegistry.deployed();
    const alastriaCredentialRegistryProxy = await Proxy.deploy(alastriaCredentialRegistry.address, ADMIN_ADDRESS, []);
    await alastriaCredentialRegistryProxy.deployed();
    console.log('credentialRegistry deployed: ', alastriaCredentialRegistryProxy.address);
    await saveAddresesInfo(
      alastriaCredentialRegistryProxy.address,
      config.credential,
      network
      );
    console.log('DEPLOYING CONTRACTS: PRESENTATION REGISTRY');
    const alastriaPresentationRegistry = await AlastriaPresentationRegistry.deploy();
    await alastriaPresentationRegistry.deployed();
    const alastriaPresentationRegistryProxy = await Proxy.deploy(alastriaPresentationRegistry.address, ADMIN_ADDRESS, []);
    await alastriaPresentationRegistryProxy.deployed();
    console.log('presentationRegistry deployed: ', alastriaPresentationRegistryProxy.address);
    await saveAddresesInfo(
      alastriaPresentationRegistryProxy.address,
      config.presentation,
      network
      );
    console.log('DEPLOYING CONTRACTS: PK REGISTRY');
    const alastriaPublicKeyRegistry = await AlastriaPublicKeyRegistry.deploy();
    await alastriaPublicKeyRegistry.deployed();
    const alastriaPublicKeyRegistryProxy = await Proxy.deploy(alastriaPublicKeyRegistry.address, ADMIN_ADDRESS, []);
    await alastriaPublicKeyRegistryProxy.deployed();
    console.log('pkRegistry deployed: ', alastriaPublicKeyRegistryProxy.address);
    await saveAddresesInfo(
      alastriaPublicKeyRegistryProxy.address,
      config.publicKey,
      network
      );

      console.log('DEPLOYING CONTRACTS: EIDAS');
      const eidasSC = await Eidas.deploy();
      await eidasSC.deployed();
      const eidasProxy = await Proxy.deploy(eidasSC.address, ADMIN_ADDRESS, []);
      await eidasProxy.deployed();
      console.log('eidas deployed: ', eidasProxy.address);
      await saveAddresesInfo(
        eidasProxy.address,
        config.eidas,
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
