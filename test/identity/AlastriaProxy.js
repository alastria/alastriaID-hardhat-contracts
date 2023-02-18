const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const exampleKey = '-----BEGIN CERTIFICATE REQUEST-----\nMIIBLTCB1AIBADAvMQswCQYDVQQGEwJFUzEPMA0GA1UECAwGTWFkcmlkMQ8wDQYD\nVQQHDAZNYWRyaWQwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASJSdsiRzdi1+ey\ng+qdXg6iOsAbSS94cb1DSQS2SNK8E0On585rgX/rw3EaN2Q+x7e3j87vg7dqVMa4\nBUtZAx0VoEMwQQYJKoZIhvcNAQkOMTQwMjAOBgNVHQ8BAf8EBAMCBaAwIAYDVR0l\nAQH/BBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAoGCCqGSM49BAMCA0gAMEUCIQDh\nldTgtkh2379n49rYfn+Tc+6PP4UZzUWUcGQf6/MVLwIgdCnsym4aIJcO2YkvgWAF\ndrgLqZEj5Ds5qLT+marHgyQ=\n-----END CERTIFICATE REQUEST-----'

describe("AlastriaProxy", function () {
    // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployProxy() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Proxy = await ethers.getContractFactory("AlastriaProxy");
    const proxy = await Proxy.deploy();
    const Registry = await ethers.getContractFactory("AlastriaPublicKeyRegistry");
    const registry = await Registry.deploy();

    return { proxy, registry, owner, otherAccount };
  }

  describe("Proxy delegate call", function () {
    it("Should delegate a call", async function () {
      const { proxy, registry, owner } = await loadFixture(deployProxy);
      const tx = await registry.populateTransaction.addPublicKey(exampleKey,0);
      await proxy.forward(registry.address, 0, tx.data);
    });

  });
})