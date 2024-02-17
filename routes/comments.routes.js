const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Comment = require("../models/Comment.model");
const Game = require("../models/Game.model");

//  POST /api/tasks  -  Creates a new task
router.post("/comments", (req, res, next) => {
  const { content, userId } = req.body;

  Comment.create({ content, author: userId })
    .then((newComment) => {
      return Game.findByIdAndUpdate(gameId, {
        $push: { comments: newComment._id },
      });
    })
    .then((res) => res.json(res))
    .catch((err) => {
      console.log("Error while creating the comment", err);
      res.status(500).json({ message: "Error while creating the comment" });
    });
});

module.exports = router;