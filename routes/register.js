const express = require("express");
var router = express.Router();
var db = require("../config/db");
var multer = require("multer");
var speakeasy = require("speakeasy");
var QRCode = require("qrcode");

const DIR = "public/uploads";
let storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, DIR);
  },
  filename: function(req, file, cb) {
    fileExtension = file.originalname.split(".")[1];
    // cb(null, file.fieldname + "-" + Date.now()  + paths.extname();
    cb(null, file.fieldname + "-" + Date.now() + "." + fileExtension);
  }
});

let upload = multer({ storage: storage });

router.get("/register", function(req, res) {
 
  res.render("pages/register.ejs", {
    title: "Registration"
  });
});

router.post("/register", upload.single("profile"), function(req, res) {
  console.log("fiillleee", req.file);
  try {
    if (req.file) {
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
      let file = req.file.filename;
      let controls = req.body.hobbies;
      let check = [];
      check.push(controls);

      console.log(check, "%$%$%$%$%$%$");
      var secret = speakeasy.generateSecret({ length: 30 });

      console.log("secret.base32 : " + secret.base32);
      let insertQuery =
        "INSERT INTO details (name, email, password, phone,country,state,city,hobbies,marital_status, gender,address, address1,pin,filename,twofa) VALUES ('" +
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
        "', '" +
        file +
        "', '" +
        secret.base32+
        "')";

      console.log("Data:  " + insertQuery);

      var select = "SELECT email FROM details where email=?";
      db.query(select, [email], function(err, resp) {
        console.log("emmaaiillsss", resp);

        if (password.length < 6) {
          console.log("error1");
          req.flash(
            "error",
            "Password length must be equal to or greater than 6"
          );
          res.redirect("/user/register");
        } else if (
          !name ||
          !email ||
          !password ||
          !phone ||
          !country ||
          !state ||
          !city ||
          !marital_status ||
          !gender ||
          !address ||
          !pin
        ) {
          console.log("error2");
          req.flash("error", "Plese fill all fields");
          res.redirect("/user/register");
        } else if (resp.length > 0) {
          console.log("error4");
          req.flash("error", "EMAIL is not unique");
          res.redirect("/user/register");
        } else {
          console.log("success");
          db.query(insertQuery, (err, result) => {
            req.flash("success", "User registered successfully");
            res.redirect("/user/login");
          });
        }
      });
    } else {
      console.log("error in uploading file!");
    }
  } catch (e) {
    console.log("erroorrr", e);
  }
});

router.get("/login", function(req, res) {
   res.render("pages/login.ejs");

});

router.post("/login", function(req, res) {

  if (!req.body.email || !req.body.password || !req.body.token) {
    req.flash("error", "Please fill credentials");
    res.redirect("/user/login");
  }
  
  
  else {
    var sql = "SELECT * FROM details where email=?  ";
    db.query(sql, [req.body.email, req.body.password], function(err, results) {
      console.log(results[0].twofa);
      var token = speakeasy.totp({
        secret: results[0].twofa,
        encoding: 'base32',
    });

    console.log('token : ' + token, req.body.token == token);




      if (results[0].status == 0) {
        req.flash("error", "You are a Blocked User");
        res.redirect("/user/login");
      }
      
      else if(req.body.token != token){
        req.flash("error", "Wrong token");
        res.redirect("/user/login");
      }
      else if (req.body.password != results[0].password) {
        req.flash("error", "Try again with right credentials");
        res.redirect("/user/login");
      }
      
      
      else {
        req.session.logged = true;
        req.session.email = req.body.email;
       
        res.redirect("/user/profile");
      }
    });
  }
})

  router.get("/profile", function(req, res) {
    var email = req.session.email;

    var sql = "SELECT * FROM details WHERE email=?";

    db.query(sql, [email], function(err, results) {
      // console.log(results,"23456");
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

  router.post("/confirm", function(req, res) {
    var x = req.body.hidden;
    var y = req.body.current;
    var z = req.body.new;
    var w = req.body.confirm;
    var pass = "SELECT password FROM details WHERE id=?";
    db.query(pass, [x], function(err, results) {
      if (z != w) {
        req.flash("error", "New password and confirm field do not match ");
        return res.redirect("/user/profile");
        console.log("88888888");
      } else if (y != results[0].password) {
        req.flash("error", "Current password field is wrong");
        res.redirect("/user/profile");
        console.log("5555555555");
      } else if (results[0].password == z) {
        req.flash(
          "error",
          "Current password and new password must be different"
        );
        res.redirect("/user/profile");
      } else {
        var sql = "UPDATE details SET password=? WHERE id=?";
        db.query(sql, [w, x], function(err, resp) {
          if (resp) {
            req.flash("success", "Password changed successfully");
            res.redirect("/user/login");
            console.log("successful");
          } else {
            console.log("error", err);
          }
        });
      }
    });
  });

  router.post("/picture", upload.single("profile"), function(req, res) {
    if (!req.file) {
      req.flash("error", "PLease select Picture");
      res.redirect("/user/update");
    } else {
      if (!req.file.filename.split(".")[1].match(/(jpg|jpeg|png)/)) {
        req.flash("error", "Image must be only in jpeg,jpg and png format");
        res.redirect("/user/update");
      } else if (req.file.size > 7000) {
        req.flash("error", "Picture size must be less than 7000 bytes");
        res.redirect("/user/update");
      } else {
        var sql = "UPDATE details SET filename=? WHERE id=?";

        db.query(sql, [req.file.filename, req.body.hidden3], function(
          err,
          result
        ) {
          console.log("result");
          req.flash("success", "Picture changed successfully");
          res.redirect("/user/profile");
        });
      }
    }
  });

router.get("/logout", function(req, res) {
  console.log("destroyed", req.session);

  req.session.destroy(function(req, resp, err) {
    if (err) {
      console.log("awzsexdrcftvgy", err);
    } else {
      console.log("destroyed");
      res.redirect("login");
    }
  });
});
module.exports = router;
