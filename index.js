const express = require("express");
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const config = require("./config");
const cookieParser = require("cookie-parser");
const formidableMiddleware = require("express-formidable");
const AuthRoutes = require("./routes/api/AuthRoutes");
const HelperRoutes = require("./routes/api/HelperRoutes");
const ItemRoutes = require("./routes/api/ItemRoutes");
const UserRoutes = require("./routes/api/UserRoutes");
const SearchRoute = require("./routes/api/SearchRoute");

app.use("/public", express.static("public"));

app.use(express.static(__dirname + "/public"));

app.use(formidableMiddleware());

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    name: "sid",
    secret: config.JWT_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);
// bottom for form submissions
app.use(express.urlencoded({ extended: false }));

// could put these into a index.js file in routes for modularization!
app.use("/", AuthRoutes);
app.use("/", ItemRoutes);
app.use("/", SearchRoute);
app.use("/", HelperRoutes);
app.use("/user", UserRoutes);

app.listen(config.PORT, () => {
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });
});

const db = mongoose.connection;

db.on("error", err => console.log(err));

db.once("open", () => {
  console.log(`Listening on port ${config.PORT}...`);
});
