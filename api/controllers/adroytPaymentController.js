const crypto = require("crypto");
const Razorpay = require("razorpay");
const { getAdroytPaymentsCollection, getAdroytOrdersCollection } = require("../models/paymentModel");

// Initialize Razorpay for Adroyt (using CalmChase keys as fallback/test)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_CALM_KEY_ID,
  key_secret: process.env.RAZORPAY_CALM_SECRET,
});

// GET /check - Service health check
exports.checkServiceStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Payment service is available",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in service check:", error);
    res.status(500).json({
      success: false,
      message: "Payment service is unavailable"
    });
  }
};

// POST /adroyt/create-order
exports.createOrder = async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount || !currency) {
    return res.status(400).json({ error: "Amount and currency are required" });
  }

  try {
    const receipt = `adroyt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    console.log("Creating Razorpay order:", { amount, currency, receipt });

    const order = await razorpay.orders.create({
      amount: parseInt(amount),
      currency,
      receipt,
    });

    console.log("Razorpay order created successfully:", order.id);

    // Log the order in MongoDB
    const ordersCollection = await getAdroytOrdersCollection();
    await ordersCollection.insertOne({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created",
      provider: "RP",
      timestamp: new Date(),
    });

    res.json({
      ...order,
      key: process.env.RAZORPAY_CALM_KEY_ID
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    const errorDescription = error.error?.description || error.details || error.message || "Unknown error";
    res.status(500).json({
      error: "Failed to create order",
      details: errorDescription
    });
  }
};

// POST /adroyt/verify-payment
exports.verifyPayment = async (req, res) => {
  console.log("=== VERIFY PAYMENT STARTED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  console.log("Extracted payment details:");
  console.log("  - Order ID:", razorpay_order_id);
  console.log("  - Payment ID:", razorpay_payment_id);
  console.log("  - Signature:", razorpay_signature);

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error("Missing required fields!");
    console.error("  - Order ID present:", !!razorpay_order_id);
    console.error("  - Payment ID present:", !!razorpay_payment_id);
    console.error("  - Signature present:", !!razorpay_signature);
    return res.status(400).json({
      status: "failure",
      message: "Missing required payment verification fields",
      missing: {
        order_id: !razorpay_order_id,
        payment_id: !razorpay_payment_id,
        signature: !razorpay_signature
      }
    });
  }

  const razorpaySecret = process.env.RAZORPAY_CALM_SECRET;
  console.log("Using Razorpay secret (first 10 chars):", razorpaySecret?.substring(0, 10) + "...");

  if (!razorpaySecret) {
    console.error("RAZORPAY_CALM_SECRET is not set in environment variables!");
    return res.status(500).json({
      status: "failure",
      message: "Server configuration error: Razorpay secret not configured"
    });
  }

  const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
  console.log("Signature payload:", signaturePayload);

  const generated_signature = crypto
    .createHmac("sha256", razorpaySecret)
    .update(signaturePayload)
    .digest("hex");

  console.log("Generated signature:", generated_signature);
  console.log("Received signature:", razorpay_signature);
  console.log("Signatures match:", generated_signature === razorpay_signature);

  if (generated_signature === razorpay_signature) {
    console.log("✅ Payment signature verified successfully!");

    // Log to MongoDB
    try {
      console.log("Attempting to log payment to MongoDB...");
      const paymentsCollection = await getAdroytPaymentsCollection();
      console.log("Payments collection retrieved");

      const paymentDoc = {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        status: "success",
        provider: "RP",
        timestamp: new Date(),
      };
      console.log("Payment document to insert:", paymentDoc);

      const result = await paymentsCollection.insertOne(paymentDoc);
      console.log("Payment logged successfully. Insert result:", result);

      res.json({
        status: "success",
        message: "Payment verified and logged successfully"
      });
    } catch (error) {
      console.error("Error logging payment to MongoDB:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        status: "failure",
        message: "Payment verified but logging failed",
        error: error.message
      });
    }
  } else {
    console.error("❌ Payment signature verification FAILED!");
    console.error("This could indicate:");
    console.error("  1. Wrong Razorpay secret key");
    console.error("  2. Tampered payment data");
    console.error("  3. Incorrect signature from client");
    res.status(400).json({
      status: "failure",
      message: "Payment verification failed: Invalid signature"
    });
  }
};

// GET /adroyt/orders - Get all Adroyt orders
exports.getOrders = async (req, res) => {
  try {
    const {
      status,
      order_timestamp_from,
      order_timestamp_to,
      payment_timestamp_from,
      payment_timestamp_to,
      page = 1,
      limit = 50
    } = req.query;

    const ordersCollection = await getAdroytOrdersCollection();
    const paymentsCollection = await getAdroytPaymentsCollection();

    // Build filter for orders
    let orderFilter = {};
    if (status) {
      orderFilter.status = status;
    }

    // Date filtering for orders
    if (order_timestamp_from || order_timestamp_to) {
      orderFilter.timestamp = {};
      if (order_timestamp_from) {
        orderFilter.timestamp.$gte = new Date(order_timestamp_from);
      }
      if (order_timestamp_to) {
        orderFilter.timestamp.$lte = new Date(order_timestamp_to);
      }
    }

    // Fetch orders
    const orders = await ordersCollection
      .find(orderFilter)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    // Fetch all payments
    const payments = await paymentsCollection.find({}).toArray();
    const paymentsMap = {};
    payments.forEach((payment) => {
      paymentsMap[payment.order_id] = {
        payment_id: payment.payment_id,
        status: payment.status,
        payment_timestamp: payment.timestamp,
      };
    });

    // Merge orders and payments
    const ordersWithPayments = orders.map((order) => {
      const payment = paymentsMap[order.order_id] || null;
      return {
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        provider: order.provider,
        order_timestamp: order.timestamp,
        payment_id: payment?.payment_id || null,
        payment_status: payment?.status || "pending",
        payment_timestamp: payment?.payment_timestamp || null,
      };
    });

    // Additional filtering based on payment data
    let filteredOrders = ordersWithPayments;

    // Payment date filtering
    const paymentFromMs = payment_timestamp_from ? new Date(payment_timestamp_from).getTime() : null;
    const paymentToMs = payment_timestamp_to ? new Date(payment_timestamp_to).getTime() : null;

    const toMillis = (dateStr) => {
      if (!dateStr) return 0;
      const d = new Date(dateStr);
      return d.getTime();
    };

    if (paymentFromMs || paymentToMs) {
      filteredOrders = filteredOrders.filter((entry) => {
        const paymentMs = toMillis(entry.payment_timestamp);
        return (
          (!paymentFromMs || (paymentMs > 0 && paymentMs >= paymentFromMs)) &&
          (!paymentToMs || (paymentMs > 0 && paymentMs <= paymentToMs))
        );
      });
    }

    // Sort by timestamp (payment or order)
    filteredOrders.sort((a, b) => {
      const t1 = toMillis(a.payment_timestamp || a.order_timestamp);
      const t2 = toMillis(b.payment_timestamp || b.order_timestamp);
      return t2 - t1;
    });

    const total = await ordersCollection.countDocuments(orderFilter);

    res.json({
      orders: filteredOrders,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// GET /adroyt/payments - Get all Adroyt payments
exports.getPayments = async (req, res) => {
  try {
    const {
      status,
      payment_timestamp_from,
      payment_timestamp_to,
      page = 1,
      limit = 50
    } = req.query;

    const paymentsCollection = await getAdroytPaymentsCollection();

    // Build filter
    let filter = {};
    if (status) {
      filter.status = status;
    }

    // Date filtering
    if (payment_timestamp_from || payment_timestamp_to) {
      filter.timestamp = {};
      if (payment_timestamp_from) {
        filter.timestamp.$gte = new Date(payment_timestamp_from);
      }
      if (payment_timestamp_to) {
        filter.timestamp.$lte = new Date(payment_timestamp_to);
      }
    }

    // Fetch payments
    const payments = await paymentsCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    const total = await paymentsCollection.countDocuments(filter);

    res.json({
      payments,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};
