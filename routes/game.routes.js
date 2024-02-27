const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Game = require("../models/Game.model");
const User = require("../models/User.model")

//  POST /games  -  Creates a new game
router.post("/", (req, res, next) => {
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
    image: image,
    comments: comments,
  };
  game.author = _id;

  Game.create(game)
    .then((newGame) => {
      return User.findByIdAndUpdate(_id, { $push: { games: newGame._id } });
    })
    .then((newGameAuthor) => {
      return res.json(newGameAuthor);
      // console.log(res)
    })
    .catch((err) => {
      console.log("Error while creating game", err);
      res.status(500).json({ message: "Error while creating games" });
    });
});

//  GET /games -  Retrieves all games
router.get("/", (req, res, next) => {
  Game.find()
    .populate("comments")
    .then((allGames) => res.json(allGames))
    .catch((err) => {
      console.log("Error while getting games", err);
      res.status(500).json({ message: "Error while getting games" });
    });
});

//  GET /games/:gameId -  Retrieves a specific game by id
router.get("/:gameId", (req, res, next) => {
  const { gameId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  // Each Game document has `comments` array holding `_id`s of Comment documents
  // We use .populate() method to get swap the `_id`s for the actual Comment documents
  Game.findById(gameId)
    .populate("comments")
    .then((game) => res.status(200).json(game))
    .catch((err) => {
      console.log("Error while retrieving the game", err);
      res.status(500).json({ message: "Error while retrieving the game" });
    });
});

// PUT  /games/:gameId  -  Updates a specific game by id
router.put("/:gameId", (req, res, next) => {
  const { gameId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Game.findByIdAndUpdate(gameId, req.body, { new: true })
    .then((updatedGame) => res.json(updatedGame))
    .catch((err) => {
      console.log("Error while updating the game", err);
      res.status(500).json({ message: "Error while updating the game" });
    });
});

// DELETE  /games/:gameId  -  Deletes a specific game by id
router.delete("/:gameId", (req, res, next) => {
  const { gameId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Game.findByIdAndDelete(gameId)
    .then(() =>
      res.json({
        message: `Game with ${gameId} is removed successfully.`,
      })
    )
    .catch((err) => {
      console.log("Error while deleting the game", err);
      res.status(500).json({ message: "Error while deleting the game" });
    });
});

module.exports = router;
