const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const BYTES32_0 = '0x0000000000000000000000000000000000000000000000000000000000000000'
const BYTES32_1 = '0x0000000000000000000000000000000000000000000000000000000000000001'

describe("AlastriaNameService", function () {
    // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployANS() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const ANS = await ethers.getContractFactory("AlastriaNameService");
    const ans = await ANS.deploy(owner.address);

    return { ans, owner, otherAccount };
  }

  describe("Check deploy", function () {
    it("Should set owner as node 0 owner", async function () {
      const { ans, owner } = await loadFixture(deployANS);
      const rootOwner = await ans.owner(BYTES32_0);
      expect(rootOwner).to.equal(owner.address);
    });
  });

  describe("Check node assign and protect", function () {
    it("Should set owner for subNode", async function () {
      encoder = new ethers.utils.AbiCoder;
      const { ans, owner } = await loadFixture(deployANS);
      const tx = await ans.setSubnodeOwner(BYTES32_0, BYTES32_1, owner.address);
      const receipt = await tx.wait();
      const subNode = ethers.utils.keccak256(encoder.encode(["bytes32","bytes32"],[BYTES32_0,BYTES32_1]));
      const subnodeOwner = await ans.owner(subNode);
      expect(subnodeOwner).to.equal(owner.address);
      expect(receipt.events[0].event).to.equal('NewOwner');
    });

    it("Should reject adding node from not owner account", async function () {
      encoder = new ethers.utils.AbiCoder;
      const { ans, owner, otherAccount } = await loadFixture(deployANS);
      const ans2 = ans.connect(otherAccount);
      try {
        const tx = await ans2.setSubnodeOwner(BYTES32_0, BYTES32_1, owner.address);
        const receipt = await tx.wait();
      } catch (err) {
        expect(err.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Only owner can manage node'");
      }
    });
  })
})