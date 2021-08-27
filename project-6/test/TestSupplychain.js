// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require("SupplyChain");
const truffleAssert = require("truffle-assertions");

contract("SupplyChain", function (accounts) {
  // Declare few constants and assign a few sample accounts generated by ganache-cli
  var sku = 1;
  var upc = 1;
  const ownerID = accounts[0];
  const originFarmerID = accounts[1];
  const originFarmName = "John Doe";
  const originFarmInformation = "Yarray Valley";
  const originFarmLatitude = "-38.239770";
  const originFarmLongitude = "144.341490";
  var productID = sku + upc;
  const productNotes = "Best beans for Espresso";
  const productPrice = web3.utils.toWei("1", "ether");
  var itemState = 0;
  const distributorID = accounts[2];
  const retailerID = accounts[3];
  const consumerID = accounts[4];
  const emptyAddress = "0x00000000000000000000000000000000000000";

  const HarvestedState = 0;
  const ProcessedState = 1;
  const PackedState = 2;
  const ForSaleState = 3;
  const SoldState = 4;
  const ShippedState = 5;
  const ReceivedState = 6;
  const PurchasedState = 7;

  console.log("ganache-cli accounts used here...");
  console.log("Contract Owner: accounts[0] ", accounts[0]);
  console.log("Farmer: accounts[1] ", accounts[1]);
  console.log("Distributor: accounts[2] ", accounts[2]);
  console.log("Retailer: accounts[3] ", accounts[3]);
  console.log("Consumer: accounts[4] ", accounts[4]);

  var supplyChain;

  it("0 deployment", async () => {
    //console.log("****************************");
    supplyChain = await SupplyChain.new({ from: ownerID });
    await supplyChain.addFarmer(originFarmerID, { from: ownerID });
    await supplyChain.addDistributor(distributorID, { from: ownerID });
    await supplyChain.addRetailer(retailerID, { from: ownerID });
    await supplyChain.addConsumer(consumerID, { from: consumerID });

    //console.log("initialize supplychain contract")
  });

  //1st Test
  it("1. Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async () => {
    // Declare and Initialize a variable for event
    var eventEmitted = false;

    // Mark an item as Harvested by calling function harvestItem()
    var tx = await supplyChain.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    truffleAssert.eventEmitted(tx, "Harvested", (ev) => {
      eventEmitted = true;
      return ev.upc == 1;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferOne[0], sku, "Error: Invalid item SKU");
    assert.equal(resultBufferOne[1], upc, "Error: Invalid item UPC");
    assert.equal(
      resultBufferOne[2],
      originFarmerID,
      "Error: Missing or Invalid ownerID"
    );
    assert.equal(
      resultBufferOne[3],
      originFarmerID,
      "Error: Missing or Invalid originFarmerID"
    );
    assert.equal(
      resultBufferOne[4],
      originFarmName,
      "Error: Missing or Invalid originFarmName"
    );
    assert.equal(
      resultBufferOne[5],
      originFarmInformation,
      "Error: Missing or Invalid originFarmInformation"
    );
    assert.equal(
      resultBufferOne[6],
      originFarmLatitude,
      "Error: Missing or Invalid originFarmLatitude"
    );
    assert.equal(
      resultBufferOne[7],
      originFarmLongitude,
      "Error: Missing or Invalid originFarmLongitude"
    );
    assert.equal(resultBufferTwo[5], 0, "Error: Invalid item State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });

  //2nd Test
  it("2. Testing smart contract function processItem() that allows a farmer to process coffee", async () => {
    //const buffer1 = await supplyChain.fetchItemBufferTwo.call(upc)
    //console.log(buffer1);
    // Mark an item as Processed by calling function processtItem()
    var tx = await supplyChain.processItem(upc, { from: originFarmerID });

    // Watch the emitted event Processed()
    truffleAssert.eventEmitted(tx, "Processed", (ev) => {
      eventEmitted = true;
      return ev.upc == 1;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const buffer = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(buffer[5], ProcessedState, "Incorrect State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });

  // // 3rd Test
  it("3. Testing smart contract function packItem() that allows a farmer to pack coffee", async () => {
    // Mark an item as Packed by calling function packItem()
    //await supplyChain.processItem(upc, { from: originFarmerID });
    var tx = await supplyChain.packItem(upc, { from: originFarmerID });

    // Watch the emitted event Packed()
    truffleAssert.eventEmitted(tx, "Packed", (ev) => {
      eventEmitted = true;
      return ev.upc == 1;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const buffer = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(buffer[5], PackedState, "Incorrect State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });

  // 4th Test
  it("4. Testing smart contract function sellItem() that allows a farmer to sell coffee", async () => {
    // Mark an item as ForSale by calling function sellItem()
    //await supplyChain.processItem(upc, { from: originFarmerID });
    //await supplyChain.packItem(upc, { from: originFarmerID });
    var tx = await supplyChain.sellItem(upc, productPrice, {
      from: originFarmerID,
    });

    // Watch the emitted event ForSale()
    truffleAssert.eventEmitted(tx, "ForSale", (ev) => {
      eventEmitted = true;
      return ev.upc == upc && ev.price == productPrice;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const buffer = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(buffer[4], productPrice, "Incorrect Product Price");
    assert.equal(buffer[5], ForSaleState, "Incorrect State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });

  // 5th Test
  it("5. Testing smart contract function buyItem() that allows a distributor to buy coffee", async () => {
    //await supplyChain.processItem(upc, { from: originFarmerID });
    //await supplyChain.packItem(upc, { from: originFarmerID });
    //await supplyChain.sellItem(upc, productPrice, { from: originFarmerID });
    var tx = await supplyChain.buyItem(upc, {
      from: distributorID,
      value: web3.utils.toWei("5", "ether"),
    });

    // Mark an item as Sold by calling function buyItem()
    truffleAssert.eventEmitted(tx, "Sold", (ev) => {
      eventEmitted = true;
      return ev.upc == upc;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferOne[2], distributorID, "Invalid Owner");
    assert.equal(resultBufferTwo[6], distributorID, "Invalid Distributor");
    assert.equal(resultBufferTwo[5], SoldState, "Incorrect State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });

  // // 6th Test
  it("6. Testing smart contract function shipItem() that allows a distributor to ship coffee", async () => {
    //await supplyChain.processItem(upc, { from: originFarmerID });
    //await supplyChain.packItem(upc, { from: originFarmerID });
    //await supplyChain.sellItem(upc, productPrice, { from: originFarmerID });
    // await supplyChain.buyItem(upc, {
    //   from: distributorID,
    //   value: web3.utils.toWei("5", "ether"),
    // });

    // Watch the emitted event Shipped()
    var tx = await supplyChain.shipItem(upc, { from: originFarmerID });

    // Mark an item as Sold by calling function buyItem()
    truffleAssert.eventEmitted(tx, "Shipped", (ev) => {
      eventEmitted = true;
      return ev.upc == upc;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferTwo[5], ShippedState, "Incorrect State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });

  // // 7th Test
  it("7. Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async () => {
    //await supplyChain.processItem(upc, { from: originFarmerID });
    //await supplyChain.packItem(upc, { from: originFarmerID });
    //await supplyChain.sellItem(upc, productPrice, { from: originFarmerID });
    // await supplyChain.buyItem(upc, {
    //   from: distributorID,
    //   value: web3.utils.toWei("5", "ether"),
    // });
    //await supplyChain.shipItem(upc, { from: originFarmerID });

    var tx = await supplyChain.receiveItem(upc, { from: retailerID });

    truffleAssert.eventEmitted(tx, "Received", (ev) => {
      eventEmitted = true;
      return ev.upc == upc;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferTwo[5], ReceivedState, "Incorrect State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });


  // 8th Test
  it("8. Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async () => {
    await supplyChain.processItem(upc, { from: originFarmerID });
    await supplyChain.packItem(upc, { from: originFarmerID });
    await supplyChain.sellItem(upc, productPrice, { from: originFarmerID });
    await supplyChain.buyItem(upc, {
      from: distributorID,
      value: web3.utils.toWei("5", "ether"),
    });

    // var event = await supplyChain.Purchased()
    // truffleAssert.eventEmitted(event, "Received", (ev) => {
    //     eventEmitted = true
    //     itemState = 7
    // })

    var tx = await supplyChain.purchaseItem(upc, { from: consumerID });

    truffleAssert.eventEmitted(tx, "Purchased", (ev) => {
      eventEmitted = true;
      //itemState = 7
      return ev.upc == upc;
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferTwo[5], PurchasedState, "Incorrect State");
    assert.equal(eventEmitted, true, "Invalid event emitted");
  });

  // // 9th Test
  it("9. Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async () => {
    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await debug(supplyChain.fetchItemBufferOne.call(upc));    
    // Verify the result set:
    assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
    assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
    assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
    assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
    assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
    assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
    assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
    assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
  });

  // // 10th Test
  it("10. Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async () => {
    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
    // Verify the result set:
    assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
    assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
    assert.equal(resultBufferTwo[2], productID, 'Error: Missing or Invalid productID')
    assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid productNotes')
    assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
    assert.equal(resultBufferTwo[5], itemState, 'Error: Invalid item State')
    assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID')
    assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid retailerID')
    assert.equal(resultBufferTwo[8], consumerID, 'Error: Missing or Invalid consumerID')
  });
});
