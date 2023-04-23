const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const {
  anyValue
} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
  expect
} = require("chai");

const BYTES32_0 = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe("AlastriaIdentityManager", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployIdentityManager() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Eidas = await ethers.getContractFactory("Eidas");
    const eidas = await Eidas.deploy()

    const IM = await ethers.getContractFactory("AlastriaIdentityManager", {
      libraries: {
        Eidas: eidas.address,
      }
    }, );
    const upgadeProxy = await upgrades.deployProxy(IM, []);

    return {
      upgadeProxy,
      owner,
      otherAccount
    };
  }

  describe("Proxy delegate call", function () {
    it("Should delegate a call", async function () {
      const {
        im,
        upgadeProxy,
        owner
      } = await loadFixture(deployIdentityManager);
      //const tx = await registry.populateTransaction.addPublicKey(exampleKey,0);
      //await proxy.forward(registry.address, 0, tx.data);
    });

  });
})