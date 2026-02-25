require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// Import routes
const userRouter = require("./routes/user.route");
const courseRouter = require("./routes/course.route");
const analyticsRouter = require("./routes/analytics.route");
const orderRouter = require("./routes/order.route");
const notificationRouter = require("./routes/notification.route");
const layoutRouter = require("./routes/layout.route");
const adroytPaymentRoutes = require("./routes/adroytPaymentRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "https://adroythub.com",
    "https://www.adroythub.com",
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));

// Additional CORS headers
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again after 15 minutes.",
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Adroythub backend is running" });
});

// Payment service check
app.get("/check", (req, res) => {
    res.json({
        success: true,
        message: "Payment service is available",
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
app.use("/adroyt", limiter, adroytPaymentRoutes);
app.use("/api", limiter, userRouter);
app.use("/api", limiter, courseRouter);
app.use("/api", limiter, analyticsRouter);
app.use("/api", limiter, orderRouter);
app.use("/api", limiter, notificationRouter);
app.use("/api", limiter, layoutRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

module.exports = app;
