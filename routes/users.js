const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const db = require("../modules/mysqlpool");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { forwardAuthenticated } = require("../config/auth");

//LOgin Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("Login"));

//Register page
router.get("/register", forwardAuthenticated, (req, res) => res.render("Register"));

router.post("/register", (req, res) => {
  //console.log(res.get());
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do nor match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    console.log("Problems");
    console.log(req.body);
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    //We`re good
    let result;
    let sql = `select exists(select * from users where users.e_mail = '${email}') as reslt;`;
    db.getConnection((err, conn) => {
      conn.query(sql, (err, response) => {
        if (err) throw err;
        if (response[0].reslt) {
          errors.push({ msg: "The user is already registered" });
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          // bcrypt.genSalt(10, (err, salt) =>
          //     bcrypt.hash(password, salt, (err, hash) =>{
          //         if(err) throw err;
          //          sql = `insert into users(user_name, password, e_mail) value('${name}', "${password}", '${email}');`;
          //          console.log(hash);
          // }));
          sql = `insert into users(user_name, password, e_mail) value('${name}', "${password}", '${email}');`;

          console.log(sql);
          conn.query(sql, (err, response) => {
            if (err) throw err;
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/users/login");
          });
        }
        conn.release();
      });
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/campaigns",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
