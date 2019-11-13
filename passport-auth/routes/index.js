const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  res.render("index", { loggedIn: req.user });
});

const loginCheck = () => {
  return (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/");
    }
  };
};

router.get("/profile", loginCheck(), (req, res) => {
  res.render("profile.hbs", { user: req.user });
});

module.exports = router;
