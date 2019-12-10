const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../modules/mysqlpool");
// Load User model

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match user
      db.getConnection((err, connection) => {
        connection.query(
          `select * from users where e_mail = '${email}';`,
          (err, res) => {
            if (err) return done(err);
            if (!res.length) {
              return done(null, false, {
                message: "That email is not registered"
              });
            }
            //MAtch password
            if (!(res[0].password == password))
              return done(null, false, { message: "Password incorrect" });

            // all is well, return successful user
            return done(null, res[0]);
          }
        );
        connection.release();
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    db.getConnection((err, connection) => {
      connection.query(`select * from users where id = ${id};`, (err, rows) => {
        done(err, rows[0]);
      });
      connection.release();
    });
  });
};
