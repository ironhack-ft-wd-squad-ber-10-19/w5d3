const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../models/User");

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
  Room.find({ owner: req.user._id }).then(rooms => {
    res.render("profile.hbs", { user: req.user, rooms: rooms });
  });
});

router.get("/rooms/new", loginCheck(), (req, res) => {
  res.render("roomForm.hbs");
});

router.get("/rooms", (req, res, next) => {
  Room.find()
    .then(rooms => {
      res.render("rooms.hbs", { rooms: rooms });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:roomId", loginCheck(), (req, res, next) => {
  Room.findById(req.params.roomId)
    .populate("owner")
    .then(room => {
      res.render("roomDetail.hbs", {
        room: room,
        showDelete:
          room.owner._id.toString() === req.user._id.toString() ||
          req.user.role === "admin"
      });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/rooms", loginCheck(), (req, res, next) => {
  Room.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    owner: req.user._id
  })
    .then(room => {
      res.redirect(`/rooms/${room._id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/user/:userId", (req, res, next) => {
  return User.findById(req.params.userId)
    .then(user => {
      Room.find({ owner: req.params.userId }).then(rooms => {
        res.render("rooms", { rooms: rooms, user: user });
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:roomId/delete", (req, res, next) => {
  const query = { _id: req.params.roomId };

  if (req.user.role !== "admin") {
    query.owner = req.user._id;
  }

  Room.deleteOne(query)
    .then(() => {
      res.redirect("/rooms");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
