const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const mongouri = process.env.MAIN_MONGO_URL || process.env.MONGO_URL;
const mainmongouri = process.env.MAIN_MONGO_URL;
const mongouri4 = process.env.MONGO_URL_HACKATHON;
const mongourilatlng = process.env.MONGO_URL_LATLNG;
const mongoMainuri = process.env.DB_URL;

let client;
let mongodb;
let isConnected = false;

let client4;
let mongodb4;
let isConnected4 = false;

let client3;
let mongodb3;
let isConnected3 = false;

let client2;
let mongodb2;
let isConnected2 = false;

let client6;
let mongodb6;
let isConnected6 = false;

async function connectToHackathonDatabase() {
  if (!isConnected4) {
    try {
      client4 = new MongoClient(
        mongouri4, {
        serverApi: ServerApiVersion.v1,
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
      });

      await client4.connect();
      mongodb4 = client4.db();
      isConnected4 = true;

      console.log("✅ Connected to MongoDB");

      client4.on("close", () => {
        console.warn("⚠️ MongoDB connection lost! Reconnecting...");
        isConnected4 = false;
      });

    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }
  return { client: client4, mongodb: mongodb4 };
}

async function connectToDatabase() {
  if (!isConnected) {
    try {
      client = new MongoClient(
        mongouri, {
        serverApi: ServerApiVersion.v1,
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
      });

      await client.connect();
      mongodb = client.db();
      isConnected = true;

      console.log("✅ Connected to MongoDB");

      client.on("close", () => {
        console.warn("⚠️ MongoDB connection lost! Reconnecting...");
        isConnected = false;
      });

    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }
  return { client: client, mongodb: mongodb };
}

async function connectToDatabaseLatLng() {
  if (!isConnected3) {
    try {
      client3 = new MongoClient(
        mongourilatlng, {
        serverApi: ServerApiVersion.v1,
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
      });

      await client3.connect();
      mongodb3 = client3.db();
      isConnected3 = true;

      console.log("✅ Connected to Power");

      client3.on("close", () => {
        console.warn("⚠️ MongoDB connection lost! Reconnecting...");
        isConnected3 = false;
      });

    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }
  return { client: client3, mongodb: mongodb3 };
}

async function connectToMongoDatabase() {
  if (!isConnected2) {
    try {
      client2 = new MongoClient(mongoMainuri, {
        serverApi: ServerApiVersion.v1,
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
      });

      await client2.connect();
      mongodb2 = client2.db();
      isConnected2 = true;

      console.log("✅ Connected to MongoDB");

      client2.on("close", () => {
        console.warn("⚠️ MongoDB connection lost! Reconnecting...");
        isConnected2 = false;
      });

    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }
  return { client: client2, mongodb: mongodb2 };
}

async function connectToMainMongoDatabase() {
  if (!isConnected6) {
    try {
      client6 = new MongoClient(mainmongouri, {
        serverApi: ServerApiVersion.v1,
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
      });

      await client6.connect();
      mongodb6 = client6.db();
      isConnected6 = true;

      console.log("✅ Connected to MongoDB");

      client6.on("close", () => {
        console.warn("⚠️ MongoDB connection lost! Reconnecting...");
        isConnected6 = false;
      });

    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }
  return { client: client6, mongodb: mongodb6 };
}

module.exports = { connectToDatabase, connectToHackathonDatabase, connectToMongoDatabase, connectToDatabaseLatLng, connectToMainMongoDatabase };
