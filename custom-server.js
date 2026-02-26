/**
 * custom-server.js
 *
 * Unified entry point for Adroythub.
 * - Requests to /api/* and /adroyt/* are handled by Express (backend)
 * - All other requests are handled by Next.js (frontend)
 * - Socket.IO runs on the same HTTP server (port 3000)
 */

// Single env file — contains all frontend + backend variables
require("dotenv").config({ path: __dirname + "/.env" });

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const expressApp = require("./api/app");
const { initSocketServer } = require("./api/socketServer");
const { connectToMainMongoDatabase } = require("./api/config/database");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const PORT = parseInt(process.env.PORT || "3000", 10);

const nextApp = next({ dev, hostname, port: PORT });
const handle = nextApp.getRequestHandler();

nextApp
    .prepare()
    .then(() => {
        const server = createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                const { pathname } = parsedUrl;

                // Route backend API and payment requests to Express
                // IMPORTANT: /api/auth/* must go to Next.js (NextAuth), not Express
                if (
                    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) ||
                    pathname.startsWith("/adroyt") ||
                    pathname === "/check"
                ) {
                    return expressApp(req, res);
                }

                // All other requests handled by Next.js
                return handle(req, res, parsedUrl);
            } catch (err) {
                console.error("Error handling request:", err);
                res.statusCode = 500;
                res.end("Internal Server Error");
            }
        });

        // Attach Socket.IO to the same HTTP server
        initSocketServer(server);

        // Connect to MongoDB then start listening
        connectToMainMongoDatabase()
            .then(() => {
                server.listen(PORT, () => {
                    console.log(`\n🚀 Adroythub is running on http://${hostname}:${PORT}`);
                    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
                    console.log(`⚡ Frontend (Next.js) → http://${hostname}:${PORT}`);
                    console.log(`🔌 Backend API (Express) → http://${hostname}:${PORT}/api`);
                    console.log(`📡 Socket.IO → ws://${hostname}:${PORT}\n`);
                });
            })
            .catch((err) => {
                console.error("❌ Failed to connect to MongoDB:", err);
                process.exit(1);
            });
    })
    .catch((err) => {
        console.error("❌ Failed to prepare Next.js:", err);
        process.exit(1);
    });
