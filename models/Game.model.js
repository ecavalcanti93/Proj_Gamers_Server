const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Comment = require ('../models/Comment.model.js')
const defaultGameImage = '/src/assets/default-game-image.webp'

const gameSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
    },

    genre: {
      type: String,
      required: [true, "Genre is required."],
    },

    company: String,

    platform: {
      type: String,
      required: [true, "Platform is required."],
    },

    rating: Number,

    age: Number,

    description: String,

    image: {
      type: String,
      default: defaultGameImage,
    },

    // author: { type: Schema.Types.ObjectId, ref: "User" },

    userGames: { type: Schema.Types.ObjectId, ref: "UserGames" },

    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Game", gameSchema);
