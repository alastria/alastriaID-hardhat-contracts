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

const exampleKey = '-----BEGIN CERTIFICATE REQUEST-----\nMIIBLTCB1AIBADAvMQswCQYDVQQGEwJFUzEPMA0GA1UECAwGTWFkcmlkMQ8wDQYD\nVQQHDAZNYWRyaWQwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASJSdsiRzdi1+ey\ng+qdXg6iOsAbSS94cb1DSQS2SNK8E0On585rgX/rw3EaN2Q+x7e3j87vg7dqVMa4\nBUtZAx0VoEMwQQYJKoZIhvcNAQkOMTQwMjAOBgNVHQ8BAf8EBAMCBaAwIAYDVR0l\nAQH/BBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAoGCCqGSM49BAMCA0gAMEUCIQDh\nldTgtkh2379n49rYfn+Tc+6PP4UZzUWUcGQf6/MVLwIgdCnsym4aIJcO2YkvgWAF\ndrgLqZEj5Ds5qLT+marHgyQ=\n-----END CERTIFICATE REQUEST-----'
const exampleKey2 = '-----BEGIN PUBLIC KEY-----\nMFswDQYJKoZIhvcNAQEBBQADSgAwRwJATg45Lgv5xucy6R6Ri0pmJL9ODnsAVDx0\nGKNNe7Q6Ee/P4HOcwh/viFJ0QXhr5jwnddUaUiDap8vhx3ZmJUj7mQIDAQAB\n-----END PUBLIC KEY-----'

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
      await registry.addPublicKey(exampleKey, PEM);
      const key = await registry.getCurrentPublicKey(owner.address);
      expect(key[0]).to.equal(exampleKey);
      expect(key[1]).to.equal(PEM);
    });
    it("Should set a new public key and revoke previous", async function () {
      const { registry, owner } = await loadFixture(deployRegistry);
      await registry.addPublicKey(exampleKey, PEM);
      await registry.addPublicKey(exampleKey2, PEM);
      const key = await registry.getCurrentPublicKey(owner.address);
      const key1status = await registry.getPublicKeyStatus(owner.address, exampleKey);
      expect(key[0]).to.equal(exampleKey2);
      expect(key1status[0]).to.equal(DELETED);
      expect(Number(ethers.utils.formatUnits(key1status[1]),0)).to.be.lessThan(Number(ethers.utils.formatUnits(key1status[2],0)));
    });
    it('Initial Set for subject1, publicKey1', async function() {
      const { registry, owner, otherAccount } = await loadFixture(deployRegistry);
      const registry2 = registry.connect(otherAccount);
      const txResult = await registry2.addPublicKey(publicKey1, PEM)
      blockInfo = await ethers.provider.getBlock("latest")
      const currentPublicKey = registry.getCurrentPublicKey(otherAccount.address)
      const publicKeyStatus = await registry.getPublicKeyStatus(otherAccount.address, publicKey1)
      assert.strictEqual(publicKeyStatus[0], VALID, 'should exist')
      // assert.strictEqual(publicKeyStatus[1].toNumber(), VALID, 'should be valid')
      // assert.strictEqual(publicKeyStatus[2].toNumber(), blockInfo.timestamp, 'should be now')
      // assert.strictEqual(publicKeyStatus[3].toNumber(), 0, 'should be 0 notime')
      // assert.strictEqual(txResult.logs.length, 0, 'should be 0')
    })
  });
})