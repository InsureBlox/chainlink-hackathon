const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
//const { expectRevert, time } = require('@openzeppelin/test-helpers')

describe('Delay Insurance test', function () {

  let DelayInsurance
  let delayInsurance
  const provider = waffle.provider;
  let shipmentValue = 200000
  let pricePremium = shipmentValue / 200

  // Instantiate contract before each test
  beforeEach(async function () {
    DelayInsurance = await ethers.getContractFactory("DelayInsurance")
    delayInsurance = await DelayInsurance.deploy()
    await delayInsurance.deployed();
  });

  it('should subscribe policy', async function () {
    const [customer] = await ethers.getSigners()
    // Trigger subscribePolicy method using mocked data
    let subscribePolicy = delayInsurance.connect(customer).subscribePolicy("shipId", shipmentValue, 1637386377, 1637559177, 1000, 2000, { from: customer.address, value: pricePremium })

    await expect(subscribePolicy).to.emit(delayInsurance, 'PolicySubscription').withArgs(customer.address, 0);
  });

  it('should subscribe many policies', async function () {
    const [customer1, customer2, customer3] = await ethers.getSigners()

    // Trigger subscribePolicy method using mocked data and customer1 1
    let subscribePolicy1 = delayInsurance.connect(customer1).subscribePolicy("shipId1", shipmentValue, 1637386300, 1637559199, 1000, 2000, { from: customer1.address, value: pricePremium })
    await expect(subscribePolicy1).to.emit(delayInsurance, 'PolicySubscription').withArgs(customer1.address, 0);

    // Trigger subscribePolicy method using mocked data and customer1 2
    let subscribePolicy2 = delayInsurance.connect(customer2).subscribePolicy("shipId2", shipmentValue, 1637386322, 16375591755, 1000, 2000, { from: customer2.address, value: pricePremium })
    await expect(subscribePolicy2).to.emit(delayInsurance, 'PolicySubscription').withArgs(customer2.address, 1);

    // Trigger subscribePolicy method using mocked data and customer1 3
    let subscribePolicy3 = delayInsurance.connect(customer3).subscribePolicy("shipId3", shipmentValue, 1637386311, 1637559188, 1000, 2000, { from: customer3.address, value: pricePremium })
    await expect(subscribePolicy3).to.emit(delayInsurance, 'PolicySubscription').withArgs(customer3.address, 2);
  });

  it('Should revert if the premium is not paid', async () => {
    const [customer] = await ethers.getSigners()

    let ex;
    try {
      await delayInsurance
      .connect(customer)
      .subscribePolicy("shipId_customer1", shipmentValue, 1637386311, 1637559188, 1000, 2000, { from: customer.address, value: 0 })
    }
    catch (_ex) {
      ex = _ex;
    }
    assert(ex, 'You should pay the premium amount')
  });

  it('should verify incidents', async function () {
    const [admin, customer1, customer2] = await ethers.getSigners()

    // Set very old startDate and a future endDate to make sure the vessel journey is currently happening
    let startDate = 974448412; // startDate 17/11/2000
    let endDate = 1763366812; // startDate 17/11/2025

    // Get customer1 balance before insurance claim
    const customer1Balance1 = await provider.getBalance(customer1.address);
    console.log("customer1 balance: " + ethers.utils.formatEther(customer1Balance1))

    // Trigger subscribePolicy method
    await delayInsurance
      .connect(customer1)
      .subscribePolicy("shipId_customer1", shipmentValue, startDate, endDate, 1000, 2000, { from: customer1.address, value: pricePremium })

    // Trigger UpdateContracts method manually - this is being triggered by Chainlink Keepers
    await delayInsurance.connect(admin).UpdateContracts();

    const policyStatus = await delayInsurance.connect(customer1).getPolicyStatus();
    assert.equal(policyStatus, "RUNNING")

    // Get customer1 balance after insurance claim
    const customer1Balance2 = await provider.getBalance(customer1.address);
    console.log("customer1 balance after UpdateContracts: " + ethers.utils.formatEther(customer1Balance2))

    // Test Incomplete - WIP
  });

  it('should pay out', async function () {
    const [admin, customer] = await ethers.getSigners()

    // Set very old startDate and a future endDate to make sure the vessel journey is currently happening
    let startDate = 974448412; // startDate 17/11/2000
    let endDate = 1763366812; // startDate 17/11/2025

    // Trigger subscribePolicy method
    await delayInsurance
      .connect(customer)
      .subscribePolicy("shipId_customer1", shipmentValue, startDate, endDate, 1000, 2000, { from: customer.address, value: pricePremium })

    // Get customer1 balance before insurance claim
    const customerBalance1 = await provider.getBalance(customer.address);
    console.log("customer balance: " + ethers.utils.formatEther(customerBalance1))

    // Trigger UpdateContracts method manually - this is being triggered by Chainlink Keepers
    await delayInsurance.connect(admin).payOut(customer.address);

    const policyStatus = await delayInsurance.connect(customer).getPolicyStatus();

    // Get customer1 balance after insurance claim
    const customerBalance2 = await provider.getBalance(customer.address);
    console.log("customer balance after UpdateContracts: " + ethers.utils.formatEther(customerBalance2))

    assert.equal(customerBalance1.toString(), customerBalance2.toString())
  });

  it('Should get the policy gust threshold', async function () {
    const [customer] = await ethers.getSigners()

    // Trigger subscribePolicy method
    await delayInsurance
      .connect(customer)
      .subscribePolicy("shipId_customer", shipmentValue, 1637386311, 1637559188, 1000, 2000, { from: customer.address, value: pricePremium })

    const policyThreshold = await delayInsurance.connect(customer).getGustThreshold();
    const calculThreshold = await delayInsurance.connect(customer).calculateGustThreshold(0,0,0,0);

    assert.equal(calculThreshold.toString(), policyThreshold.toString());
  });

  it('Should get the policy status', async function () {
    const [customer] = await ethers.getSigners()

    // Trigger subscribePolicy method
    await delayInsurance
      .connect(customer)
      .subscribePolicy("shipId_customer", shipmentValue, 1637386311, 1637559188, 1000, 2000, { from: customer.address, value: pricePremium })

    console.log(await delayInsurance.connect(customer).getPolicyStatus());
    const policyStatus = await delayInsurance.connect(customer).getPolicyStatus();

    assert.equal(policyStatus, "CREATED");
  });

});
