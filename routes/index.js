const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const db = require("../modules/mysqlpool");

//Welcome
router.get("/", forwardAuthenticated, (req, res) => res.render("Welcome"));

//campaigns
router.get("/campaigns", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    conn.query(
      `select id, song_title, artist_name, personal_message from fan_links where users_id = ${req.user.id};`,
      (err, response) => {
        if (err) throw err;
        conn.query(
          `select id, song_title, unlock_type, personal_message from social_unlocks where users_id = ${req.user.id};`,
          (err, respond2) => {
            if (err) throw err;
            res.render("campaigns", {
              name: req.user.user_name,
              fan_links: response,
              social_unlocks: respond2
            });
          }
        );
      }
    );
    conn.release();
  });
});

//fanlink
router.get("/fanlink/edit/:linkid", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    conn.query(
      `select * from fan_links where id = ${req.params.linkid};`,
      (err, respond) => {
        if (err) throw err;
        conn.query(
          `select * from social_unlocks where users_id = ${req.user.id};`,
          (err, respond2) => {
            res.render("fanlink", {
              linkInfo: respond[0],
              socials_list: respond2
            });
          }
        );
      }
    );
    conn.release();
  });
});

//save fanlink
router.post("/save/:linkid", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    console.log(req.body);
    const {
      song_title,
      artist_name,
      image_path,
      soundcloud_link,
      youtube_link,
      spotify_link,
      google_play_music,
      social_unlock,
      personal_message
    } = req.body;

    let soc_un;
    if (social_unlock == "Choose...") {
      soc_un = "NULL";
    } else {
      soc_un = parseInt(social_unlock[0], 10);
    }
    conn.query(
      `call update_fan_link('${song_title}', '${artist_name}', '${image_path}', '${soundcloud_link}', '${youtube_link}', '${spotify_link}', '${google_play_music}', ${soc_un}, '${personal_message}', ${req.params.linkid});`,
      (err, respond) => {
        if (err) throw err;
        res.redirect("/campaigns");
      }
    );
    conn.release();
  });
});

//landing fanlink
router.get("/fanlink/view/:linkid", (req, res) => {
  db.getConnection((err, conn) => {
    conn.query(
      `select * from fan_links where id = ${req.params.linkid};`,
      (err, respond) => {
        if (err) throw err;
        let linkInfo = { ...respond[0] };
        if (linkInfo.social_id) {
          conn.query(
            `select unlock_type, unlock_button_text, social_network, social_network_link, unlocked_link from social_unlocks where id = ${linkInfo.social_id};`,
            (err, respond2) => {
              if (err) throw err;
              linkInfo = { ...linkInfo, ...respond2[0] };
              res.render("fanlinklanding", {
                linkInfo: linkInfo
              });
            }
          );
        } else {
          res.render("fanlinklanding", {
            linkInfo: linkInfo
          });
        }
      }
    );
    conn.release();
  });
});

router.get("/fanlink/new", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(
      `select * from social_unlocks where users_id = ${req.user.id};`,
      (err, respond) => {
        if (err) throw err;
        res.render("createfanlink", {
          socials_list: respond
        });
      }
    );
    conn.release();
  });
});

// Save New Fanlink
router.post("/fanlink/new/save", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    if (err) throw err;
    console.log(req.body);
    const {
      song_title,
      artist_name,
      image_path,
      soundcloud_link,
      youtube_link,
      spotify_link,
      google_play_music,
      social_unlock,
      personal_message
    } = req.body;

    let soc_un;
    if (social_unlock == "Choose...") {
      soc_un = "NULL";
    } else {
      soc_un = parseInt(social_unlock[0], 10);
    }
    conn.query(
      `call create_fan_link(${req.user.id}, ${soc_un}, '${song_title}', '${artist_name}', '${image_path}', '${soundcloud_link}', '${youtube_link}', '${spotify_link}', '${google_play_music}', '${personal_message}');`,
      (err, respond) => {
        if (err) throw err;
        res.redirect("/campaigns");
      }
    );
    conn.release();
  });
});

//Delete FanLink
router.get("/fanlink/delete/:linkid", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(
      `delete from fan_links where id = ${req.params.linkid};`,
      (err, respond) => {
        if (err) throw err;
        res.redirect("/campaigns");
      }
    );
    conn.release();
  });
});

//edit social link
router.get("/social-link/edit/:linkid", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(
      `select * from social_unlocks where id = ${req.params.linkid};`,
      (err, respond) => {
        if (err) throw err;
        res.render("sociallink", {
          linkInfo: respond[0]
        });
      }
    );
    conn.release();
  });
});

router.post("/social-link/save/:linkid", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    if(err) throw err;
    const {
      song_title,
      unlock_type,
      unlock_button_text,
      image_path,
      social_network,
      social_network_link,
      unlocked_link,
      personal_message
    } = req.body;

    conn.query(`call update_social_link(
      '${song_title}', '${unlock_type}', '${unlock_button_text}', 
      '${image_path}', '${social_network}', '${social_network_link}', 
      '${unlocked_link}', '${personal_message}', ${req.params.linkid});`, (err, respond) => {

      if(err) throw err;
      res.redirect('/campaigns');

    });
  });
});

//save social link
router.post("/social-link/new/save", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    console.log(req.body);
    const {
      song_title,
      unlock_type,
      unlock_button_text,
      image_path,
      social_network,
      social_network_link,
      unlocked_link,
      personal_message
    } = req.body;

    conn.query(
      `call create_social_link(${req.user.id}, '${song_title}', '${unlock_type}', '${unlock_button_text}', '${image_path}', '${social_network}', '${social_network_link}', '${unlocked_link}', '${personal_message}');`,
      (err, respond) => {
        if (err) throw err;
        res.redirect("/campaigns");
      }
    );
    conn.release();
  });
});

//Delete SocialLink
router.get("/social-link/delete/:linkid", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(
      `delete from social_unlocks where id = ${req.params.linkid};`,
      (err, respond) => {
        if (err) throw err;
        res.redirect("/campaigns");
      }
    );
    conn.release();
  });
});

//social link landing
router.get("/social-link/view/:linkid", (req, res) => {
  db.getConnection((err, conn) => {
    conn.query(
      `select * from social_unlocks where id = ${req.params.linkid};`,
      (err, respond) => {
        if (err) throw err;
        res.render("sociallinklanding", {
          linkInfo: respond[0]
        });
      }
    );
    conn.release();
  });
});

//new social link
router.get("/social-link/new", ensureAuthenticated, (req, res) => {
  res.render("createsociallink");
});

// Save New SocialLink
// router.post("/social-link/new/save", ensureAuthenticated, (req, res) => {
//   db.getConnection((err, conn) => {
//     if (err) throw err;
//     console.log(req.body);
//     const {
//       song_title,
//       artist_name,
//       image_path,
//       soundcloud_link,
//       youtube_link,
//       spotify_link,
//       google_play_music,
//       social_unlock,
//       personal_message
//     } = req.body;

//     let soc_un;
//     if (social_unlock == "Choose...") {
//       soc_un = "NULL";
//     } else {
//       soc_un = parseInt(social_unlock[0], 10);
//     }
//     conn.query(
//       `call create_fan_link(${req.user.id}, ${soc_un}, '${song_title}', '${artist_name}', '${image_path}', '${soundcloud_link}', '${youtube_link}', '${spotify_link}', '${google_play_music}', '${personal_message}');`,
//       (err, respond) => {
//         if (err) throw err;
//         res.redirect("/campaigns");
//       }
//     );
//     conn.release();
//   });
// });

//Settings
router.get("/settings/", ensureAuthenticated, (req, res) => {
  db.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(`select * from users where id = ${req.user.id};`, (err, respond) => {
      res.render("settings", {
        linkInfo: respond[0]
      });
    });
    conn.release();
  });
});

router.post("/settings/save", ensureAuthenticated, (req, res) => {
  const { user_name, email, password } = req.body;
  
    db.getConnection((err, conn) => {
      if (err) throw err;
      conn.query(
        `update users set user_name = '${user_name}', e_mail = '${email}', password = '${password}' where id = ${req.user.id};`,
        (err, respond) => {
          if (err) throw err;
          res.redirect("/settings"); 
        }
      );
      conn.release();
    });
});

console.log("lol");

module.exports = router;
