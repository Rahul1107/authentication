//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
mongoose.connect(process.env.MONGODB_, { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, (err, user) => {
      if (err) {
        console.log(err);
      } else {
        if (user) {
          bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
              res.render("secrets");
            }
          });
        }
      }
    });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      const newUser = new User({
        email: req.body.username,
        password: hash,
      });
      newUser.save((err) => {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets");
        }
      });
    });
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
