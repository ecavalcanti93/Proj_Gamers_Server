const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Game = require("../models/Game.model");
const User = require("../models/User.model");
const UserGames = require("../models/UserGames.model");

const fileUploader = require("../config/cloudinary.config");
const { isAuthenticated } = require("../middleware/jwt.middleware");

//  POST /games  -  Creates a new game
router.post("/", isAuthenticated, fileUploader.single("image"), (req, res, next) => {
  const {
    title,
    genre,
    company,
    platform,
    rating,
    age,
    description,
    image,
    comments,
  } = req.body;
  const { _id } = req.payload;
  const game = {
    title: title,
    genre: genre,
    company: company,
    platform: platform,
    rating: rating,
    age: age,
    description: description,
    image: undefined,
    comments: comments,
    userGames: null,
  };

  game.author = _id;

  if (req.hasOwnProperty("file")) {
    game.image = req.file.path;
  }
  Game.findOne({ title }).then((foundGame) => {
    if (foundGame) {
      // console.log(foundGame);
      UserGames.findByIdAndUpdate(
        foundGame.userGames,
        { $push: { owners: _id } },
        { new: true }
      ).exec();
      return User.findByIdAndUpdate(
        _id,
        { $push: { games: foundGame._id } },
        { new: true }
      ).then((updatedUserGames) => {
        return res.json(updatedUserGames);
      });
    }

    Game.create(game)
      .then((newGame) => {
        const userGame = {
          gameId: newGame._id,
          owners: [_id],
        };
        return UserGames.create(userGame);
      })
      .then((newUserGames) => {
        return Game.findByIdAndUpdate(newUserGames.gameId, {
          userGames: newUserGames._id,
        });
      })
      .then((newGameUserGames) => {
        return User.findByIdAndUpdate(
          _id,
          { $push: { games: newGameUserGames._id } },
          { new: true }
        );
      })
      .then((updatedUser) => {
        return res.json(updatedUser);
      })
      .catch((err) => {
        console.log("Error while creating game", err);
        res.status(500).json({ message: "Error while creating games" });
      });
  });
});

//  GET /games -  Retrieves all games
router.get("/", (req, res, next) => {
  Game.find()
    .populate({
      path: "userGames",
      populate: {
        path: "owners",
      },
    })
    .populate({
      path: "author",
    })
    .then((allGames) => res.json(allGames))
    .catch((err) => {
      console.log("Error while getting games", err);
      res.status(500).json({ message: "Error while getting games" });
    });
});

//  GET /games/:gameId -  Retrieves a specific game by id
router.get("/:gameId", isAuthenticated, (req, res, next) => {
  const { gameId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  // Each Game document has `comments` array holding `_id`s of Comment documents
  // We use .populate() method to get swap the `_id`s for the actual Comment documents
  Game.findById(gameId)
    .populate({
      path: "author",
    })
    .populate({
      path: "userGames",
      populate: {
        path: "owners",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    .then((game) => res.status(200).json(game))
    .catch((err) => {
      console.log("Error while retrieving the game", err);
      res.status(500).json({ message: "Error while retrieving the game" });
    });
});

// PUT  /games/:gameId  -  Updates a specific game by id
router.post("/:gameId", isAuthenticated, fileUploader.single("image"), (req, res, next) => {
  const { gameId } = req.params;
  const updatedGame = {...req.body}
  // console.log(req.body);

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  if (req.hasOwnProperty("file")) {
    updatedGame.image = req.file.path;
    
  }

  Game.findByIdAndUpdate(gameId, updatedGame, { new: true })
    .then((updatedGame) => res.json(updatedGame))
    .catch((err) => {
      console.log("Error while updating the game", err);
      res.status(500).json({ message: "Error while updating the game" });
    });
});

// // DELETE  /games/:gameId  -  Deletes a specific game by id
// router.delete("/:gameId", isAuthenticated, (req, res, next) => {
//   const { gameId } = req.params;
//   const { _id } = req.payload;

//   if (!mongoose.Types.ObjectId.isValid(gameId)) {
//     res.status(400).json({ message: "Specified id is not valid" });
//     return;
//   }

//   Game.findByIdAndDelete(gameId)
//     .then(() =>
//       res.json({
//         message: `Game with ${gameId} is removed successfully.`,
//       })
//     )
//     .catch((err) => {
//       console.log("Error while deleting the game", err);
//       res.status(500).json({ message: "Error while deleting the game" });
//     });
// });

// REMOVE  /games/:gameId  -  Remove a specific game by id from your library
router.delete("/:gameId", isAuthenticated, (req, res, next) => {
  const { gameId } = req.params;
  const { _id } = req.payload;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(_id).then((user) => {
    user.games.pull(gameId);
    user.save();
  });

  Game.findById(gameId)
    .populate({
      path: "userGames",
      // select: "username -_id",
    })
    .then((game) => {
      return game.userGames;
    })
    .then((userGames) => {
      userGames.owners.pull(_id);
      userGames.save();
    })
    .then(() =>
      res.json({
        message: `Game with ${gameId} is removed successfully.`,
      })
    )
    .catch((err) => {
      console.log("Error while removing the game", err);
      res.status(500).json({ message: "Error while removing the game" });
    });
});

module.exports = router;
