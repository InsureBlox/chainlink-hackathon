const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Delay Insurance test", function () {

  let DelayInsurance
  let delayInsurance

  beforeEach(async function () {
    DelayInsurance = await ethers.getContractFactory("DelayInsurance")
    delayInsurance = await DelayInsurance.deploy()
    await delayInsurance.deployed();
  });

  it("should subscribe policy", async function () {
    const [admin, customer] = await ethers.getSigners()
    let shipmentValue = 200000
    let pricePremium = shipmentValue / 200

    let subscribePolicy = delayInsurance.connect(customer).subscribePolicy("shipId", shipmentValue, 1637386377, 1637559177, 1000, 2000, { from: customer.address, value: pricePremium })

    await expect(subscribePolicy).to.emit(delayInsurance, 'PolicySubscription').withArgs(customer.address, 0);
  });

  it("should pay to subscribe policy", async function () {
    const [customer] = await ethers.getSigners()
    let shipmentValue = 200000
    let pricePremium = shipmentValue / 200

    await delayInsurance.connect(customer).subscribePolicy("shipId", shipmentValue, 1637386377, 1637559177, 1000, 2000, { from: customer.address, value: pricePremium })

    const balance = await ethers.provider.getBalance(delayInsurance.address);
    assert.equal(balance.toString(), pricePremium.toString());

  });


  it("should verify incidents", async function () {
    const [admin, customer1, customer2] = await ethers.getSigners()
    let shipmentValue = 500000
    let pricePremium = shipmentValue / 200

    await delayInsurance
      .connect(customer1)
      .subscribePolicy("shipId_customer1", shipmentValue, 1637386999, 1637576177, 1000, 2000, { from: customer1.address, value: pricePremium })

    await delayInsurance
      .connect(customer2)
      .subscribePolicy("shipId_customer2", shipmentValue, 1637386377, 1637559177, 1000, 2000, { from: customer2.address, value: pricePremium })

    await delayInsurance.connect(admin).verifyIncidents();

    // Contract WIP
  });

  it("should pay out", async function () {
    const [admin, customer1, customer2] = await ethers.getSigners()
    let shipmentValue = 500000
    let pricePremium = shipmentValue / 200

    await delayInsurance
      .connect(customer1)
      .subscribePolicy("shipId_customer1", shipmentValue, 1637386999, 1637576177, 1000, 2000, { from: customer1.address, value: pricePremium })

    await delayInsurance
      .connect(customer2)
      .subscribePolicy("shipId_customer2", shipmentValue, 1637386377, 1637559177, 1000, 2000, { from: customer2.address, value: pricePremium })

    await delayInsurance.connect(admin).verifyIncidents();

    // Contract WIP
  });

});
