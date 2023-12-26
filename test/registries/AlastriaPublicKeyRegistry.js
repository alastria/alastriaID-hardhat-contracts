const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");

const JWK = 0;
const PEM = 1;
const DER = 2;
const VALID = 1;
const DELETED = 0;

const exampleKey = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const exampleKey2 = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

const publicKey1 = "PublicKey1";  // Should be web3.eth.abi.encodeParameter("bytes32","WhatEver")º)
const publicKey2 = "PublicKey2";
const publicKey3 = "PublicKey2";
const publicKey4 = "PublicKey4";

describe("AlastriaPublicKeyRegistry", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployRegistry() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("AlastriaPublicKeyRegistry");
    const registry = await Registry.deploy();

    return { registry, owner, otherAccount };
  }

  describe("Public key lifecycle", function () {
    it("Should set a public key", async function () {
      const { registry, owner } = await loadFixture(deployRegistry);
      await registry.addKey(exampleKey);
      const key = await registry.getCurrentPublicKey(owner.address);
      expect(key).to.equal(exampleKey);
    });
    it("Should set a new public key and revoke previous", async function () {
      const { registry, owner } = await loadFixture(deployRegistry);
      // KEY 1
      await registry.addKey(exampleKey);      
      // KEY 2
      await registry.addKey(exampleKey2);
      // GET STATUS & KEY
      const key = await registry.getCurrentPublicKey(owner.address);
      const keyHash1 = ethers.utils.solidityKeccak256([ "string" ], [ exampleKey ])
      const key1status = await registry.getPublicKeyStatus(owner.address, keyHash1);
      const keyHash2 = ethers.utils.solidityKeccak256([ "string" ], [ exampleKey2 ])
      const key2status = await registry.getPublicKeyStatus(owner.address, keyHash2);
      // ASSERTS
      expect(key).to.equal(exampleKey2);
      expect(Number(ethers.utils.formatUnits(key1status[1]),0)).to.be.lessThan(Number(ethers.utils.formatUnits(key1status[2],0)));
    });
    it('Initial Set for subject1, publicKey1', async function() {
      const { registry, owner, otherAccount } = await loadFixture(deployRegistry);
      const registry2 = registry.connect(otherAccount);
      const txResult = await registry2.addKey(publicKey1)
      blockInfo = await ethers.provider.getBlock("latest")
      const currentPublicKey = registry.getCurrentPublicKey(otherAccount.address)
      const keyHash = ethers.utils.solidityKeccak256([ "string" ], [ publicKey1 ])
      const publicKeyStatus = await registry.getPublicKeyStatus(otherAccount.address, keyHash)
      assert.strictEqual(publicKeyStatus[0], true, 'should exist')
      // assert.strictEqual(publicKeyStatus[1].toNumber(), VALID, 'should be valid')
      // assert.strictEqual(publicKeyStatus[2].toNumber(), blockInfo.timestamp, 'should be now')
      // assert.strictEqual(publicKeyStatus[3].toNumber(), 0, 'should be 0 notime')
      // assert.strictEqual(txResult.logs.length, 0, 'should be 0')
    })
  });
})