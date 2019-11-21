module.exports = {
  ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8080,
  URL: process.env.BASE_URL || 'http://localhost:3000',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb://manav:manav123@ds141454.mlab.com:41454/cse356',
  JWT_SECRET: process.env.JWT_SECRET || 'mysecret'
};
