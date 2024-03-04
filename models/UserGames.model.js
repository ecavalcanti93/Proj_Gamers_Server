const { Schema, model } = require("mongoose");

const userGamesSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game" },
    owners: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true
  }
);

const UserGames = model("UserGames", userGamesSchema);

module.exports = UserGames;