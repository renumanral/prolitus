const express = require("express");
var session = require("express-session");
var app = express();
const db = require("./config/db");
var bodyParser = require("body-parser");
var flash = require("connect-flash");


// Configure middleware
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extented: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

//ejs
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/user", require("./routes/register"));
app.use("/admin", require("./routes/admin"));

app.all("*",function(req,res){
  
    res.render("pages/404.ejs")

});

app.listen(4000, function() {
  console.log("server running at port:4000");
});
