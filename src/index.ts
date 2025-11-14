import app from "./app";

const port = Number(process.env.PORT ?? 3000);

// Validate port is a valid number
if (isNaN(port) || port < 1 || port > 65535) {
  throw new Error("Invalid PORT environment variable");
}

// Start the HTTP server (index.ts sólo hace bootstrap)
const server = app.listen(port, () => {
  console.log(`✓ MoneyWise API running at http://localhost:${port}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ Health check: http://localhost:${port}/health`);
});

server.on("error", (err) => {
  console.error("✗ Server error:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});