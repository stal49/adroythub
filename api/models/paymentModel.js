const { connectToMainMongoDatabase } = require("../config/database");

// Get payments collection
const getPaymentsCollection = async () => {
  const { mongodb } = await connectToMainMongoDatabase();
  return mongodb.collection("payments");
};

// Get orders collection
const getOrdersCollection = async () => {
  const { mongodb } = await connectToMainMongoDatabase();
  return mongodb.collection("orders");
};

// Get CalmChase payments collection
const getCalmChasePaymentsCollection = async () => {
  const { mongodb } = await connectToMainMongoDatabase();
  return mongodb.collection("calmchase_payments");
};

// Get CalmChase orders collection
const getCalmChaseOrdersCollection = async () => {
  const { mongodb } = await connectToMainMongoDatabase();
  return mongodb.collection("calmchase_orders");
};

// Get Adroyt payments collection
const getAdroytPaymentsCollection = async () => {
  const { mongodb } = await connectToMainMongoDatabase();
  return mongodb.collection("adroyt_payments");
};

// Get Adroyt orders collection
const getAdroytOrdersCollection = async () => {
  const { mongodb } = await connectToMainMongoDatabase();
  return mongodb.collection("adroyt_orders");
};

module.exports = {
  getPaymentsCollection,
  getOrdersCollection,
  getCalmChasePaymentsCollection,
  getCalmChaseOrdersCollection,
  getAdroytPaymentsCollection,
  getAdroytOrdersCollection
};
