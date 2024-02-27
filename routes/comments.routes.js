const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Comment = require("../models/Comment.model");
const Game = require("../models/Game.model");

//  POST /api/tasks  -  Creates a new task
router.post("/:gameId/comment", (req, res, next) => {
  const { content } = req.body;
  const { gameId } = req.params;
  const { _id } = req.payload;
  const comment = {
    content: content
  };
  comment.author = _id;

  Comment.create(comment)
    .then((newComment) => {
      return Game.findByIdAndUpdate(gameId, {
        $push: { comments: newComment._id },
      });
    })
    .then((res) => {
      return res.json(res)
    })
    .catch((err) => {
      console.log("Error while creating the comment", err);
      res.status(500).json({ message: "Error while creating the comment" });
    });
});

module.exports = router;