const express = require("express");
var router = express.Router();
var db = require("../config/db");

router.get("/register", function(req, res) {
  res.render("pages/register.ejs", {
    title: "Registration"
  });
});

router.post("/register", function(req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let phone = req.body.phone;
  let country = req.body.country;
  let state = req.body.state;
  let city = req.body.city;
  let hobbies = req.body.hobbies;
  let marital_status = req.body.status;
  let gender = req.body.gender;
  let address = req.body.address;
  let address1 = req.body.address1;
  let pin = req.body.pin;
  let controls = req.body.hobbies;
  let check;
  check = hobbies.join();

  let insertQuery =
    "INSERT INTO details (name, email, password, phone,country,state,city,hobbies,marital_status, gender,address, address1,pin) VALUES ('" +
    name +
    "', '" +
    email +
    "', '" +
    password +
    "', '" +
    phone +
    "', '" +
    country +
    "', '" +
    state +
    "', '" +
    city +
    "', '" +
    check +
    "', '" +
    marital_status +
    "', '" +
    gender +
    "', '" +
    address +
    "', '" +
    address1 +
    "', '" +
    pin +
    "')";

  console.log("Data:  " + insertQuery);
  db.query(insertQuery, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      req.flash("success", "User registered successfully");
      res.redirect("/user/login");
    }
  });
});

router.get("/login", function(req, res) {
  res.render("pages/login.ejs");
});

router.post("/login", function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  if (email && password) {
    var sql = "SELECT * FROM details where email=? AND password=? AND status=?";
    db.query(sql, [email, password, 1], function(err, results) {
      if (results.length > 0) {
        req.session.logged = true;
        req.session.email = email;
        res.redirect("/user/profile");
      } else {
        req.flash("error", "Try again with right credentials");
        res.redirect("/user/login");
      }
    });
  } else {
    req.flash("error", "Please fill credentials");
    res.redirect("/user/login");
  }
});

router.get("/profile", function(req, res) {
  var email = req.session.email;

  var sql = "SELECT * FROM details WHERE email=?";

  db.query(sql, [email], function(err, results) {
    if (results.length > 0) {
      res.render("pages/profile.ejs", {
        title: "Profile Page",
        results: results[0]
      });
    }
  });
});

router.get("/update", function(req, res) {
  var email = req.session.email;
  var sql = "SELECT * FROM details WHERE email=?";

  db.query(sql, [email], function(err, results) {
    if (results.length > 0) {
      res.render("pages/update.ejs", {
        title: "update page",
        results: results[0]
      });
    }
  });
});

router.post("/update", function(req, res) {
  var users = {
    name: req.body.name,
    phone: req.body.phone,
    hobbies: req.body.hobbies,
    gender: req.body.gender,
    marital_status: req.body.marital_status,
    pin: req.body.pin,
    country: req.body.country,
    state: req.body.state,
    city: req.body.city,
    address: req.body.address
  };

  var email = req.body.email;

  var sql = "UPDATE  details  SET ? WHERE email= ? ";
  console.log("users", users, sql);
  db.query(sql, [users, email], function(error, results) {
    if (results) {
      res.redirect("/user/profile");
    } else {
      console.log("error", error);
    }
  });
});

router.get("/password", function(req, res) {
  res.render("modal.ejs", {
    title: "password"
  });
});

router.post("/confirm", function(req, res) {
  var x = req.body.hidden;
  var y = req.body.current;
  var z = req.body.new;
  var w = req.body.confirm;
  var pass = "SELECT password FROM details WHERE id=?";
  db.query(pass, [x], function(err, results) {
    console.log("###########", results);

    
      if (z != w) {
        req.flash("error", "New password and confirm field do not match ");
        return res.redirect("/user/profile");
        console.log("88888888");
      } else if (y != results[0].password) {
        req.flash("error", "Current password field is wrong");
        res.redirect("/user/profile");
        console.log("5555555555");
      }else if(results[0].password==z){
        req.flash("error", "Current password and new password must be different");
        res.redirect("/user/profile");
      } else {
        var sql = "UPDATE details SET password=? WHERE id=?";
        db.query(sql, [w, x], function(err, resp) {
          if (resp) {
            req.flash("success", "Password changed successfully");
            res.redirect("/user/login");
            console.log("successful");
          } else {
            console.log("2ek3jmmmmmmmmmmmmmmmr89", err);
          }
        });
      }
 
  });
});
module.exports = router;
