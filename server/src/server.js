require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/database");
const { initSocket } = require("./lib/socket");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running");
});

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
