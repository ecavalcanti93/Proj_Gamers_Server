const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Comment = require ('../models/Comment.model.js')
<<<<<<< HEAD
const defaultGameImage = 'https://res.cloudinary.com/drgolc0gb/image/upload/v1710345439/Proj_Gamers/i600rsj5rphab5vjjwcg.jpg'
// const defaultGameImage = '/src/assets/default-game-image.webp'
=======
const defaultGameImage = '/src/assets/default-game-image.jpg'
// const defaultGameImage = '../public/images/default-game-image.jpg'
>>>>>>> 417a87e7c7073d9201f890fa7cf2a9cebfe8ea7e

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

    author: { type: Schema.Types.ObjectId, ref: "User" },

    userGames: { type: Schema.Types.ObjectId, ref: "UserGames" },

    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Game", gameSchema);
