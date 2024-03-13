const { Schema, model } = require("mongoose");
// const defaultUserImage = '/src/assets/logo.png'
const defaultUserImage = 'https://res.cloudinary.com/drgolc0gb/image/upload/v1710345943/Proj_Gamers/j90o7xjjalpkch2dz3ye.png'
// const defaultUserImage = '/src/static/images/logo.png'

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },

    userImage: {
      type: String,
      default: defaultUserImage,
    },
    games: [{ type: Schema.Types.ObjectId, ref: "Game" }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

userSchema.pre('findOneAndUpdate', function(next) {

  this.model.findOne(this.getQuery())
    .then( modelData => {
      if (modelData.imageUrl === null) {
        modelData.imageUrl = defaultUserImage;
      }
      modelData.save();
    })
  next();
});


const User = model("User", userSchema);

module.exports = User;
