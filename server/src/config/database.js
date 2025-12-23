const mongoose = require("mongoose");

const DEFAULT_URI = "mongodb://127.0.0.1:27017/job-portal";

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || DEFAULT_URI;

  try {
    await mongoose.connect(mongoURI, {
      autoIndex: true,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

const getConnectionStatus = () => ({
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host,
  name: mongoose.connection.name,
  models: Object.keys(mongoose.connection.models),
});

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
module.exports.getConnectionStatus = getConnectionStatus;
