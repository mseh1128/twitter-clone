module.exports = {
  ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  URL: process.env.BASE_URL || "http://localhost:3000",
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb://manav123:J4EV8vit426BWQ@ds241258.mlab.com:41258/milestone",
  JWT_SECRET: process.env.JWT_SECRET || "mysecret"
};
