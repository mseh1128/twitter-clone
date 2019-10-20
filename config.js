module.exports = {
  ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  URL: process.env.BASE_URL || "http://localhost:3000",
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://mseh1128:manav123@cluster0-obs78.mongodb.net/test?retryWrites=true&w=majority",
  JWT_SECRET: process.env.JWT_SECRET || "mysecret"
};
