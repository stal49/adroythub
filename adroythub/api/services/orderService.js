const { CatchAsyncError } = require("../middleware/catchAsyncErrors");
const { getOrderCollection } = require("../models/orderModel");

// create new order
exports.newOrder = CatchAsyncError(async (data, res) => {
    const ordersCollection = await getOrderCollection();  // Access the order collection
    const result = await ordersCollection.insertOne(data);  // Insert data into the collection

    return res.status(201).json({
        success: true,
        order: result,  // The inserted order document
    });
});

// Get All Orders
exports.getAllOrdersService = async (res) => {
    const ordersCollection = await getOrderCollection();  // Access the order collection
    const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();  // Get all orders

    res.status(200).json({
        success: true,
        orders,
    });
};
