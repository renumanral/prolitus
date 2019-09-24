var express = require("express");
var router = express.Router();
var db = require("../config/db");
var mysql= require("mysql");

router.get("/login", function(req, res) {
  res.render("pages/adminlogin.ejs", {
    title: "admin login"
  });
});

router.post("/login", function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  var sql = "SELECT is_admin FROM details WHERE email=?";
  db.query(sql, [email], function(err, results) {
    if (results) {
      if (results[0].is_admin == 1) {
        req.flash("success", "Your welcome, Admin");

        res.redirect("/admin/dashboard");
      } else {
        req.flash("error", "You are not the admin");
        res.redirect("/admin/login");
      }
    } else {
      console.log("sorry", err);
    }
  });
});

router.get("/dashboard", function(req, res) {
  var sql = "SELECT * FROM details ";
  db.query(sql, function(err, result) {
    if (result) {
      res.render("pages/dashboard.ejs", {
        result: result
      });
    }
  });
});

router.post("/block",function(req,res){
   
    var x = req.body.hidden;
    var y = req.body.hidden1;


    var sqlss = mysql.format("UPDATE details SET status = ? WHERE id = ?", [y, x]);
    console.log("4444444444444", sqlss)
    db.query(sqlss, function (error, results) {
        if (error) {
            console.error('Err3or', error);
        }
        else {
             req.flash('success', 'Changes have been done successfully');
             res.redirect('/admin/dashboard')
        }
    });


});


router.get("/name",function(req,res){
  var sql = "SELECT * FROM details ORDER BY name ";
  db.query(sql, function(err, result) {
    if (result) {
      res.render("pages/dashboard.ejs", {
        result: result
      });
    }
  });
  

});
module.exports = router;
