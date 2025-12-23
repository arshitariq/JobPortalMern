const crypto = require("crypto");

const generateRawToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

module.exports = { generateRawToken, hashToken };
