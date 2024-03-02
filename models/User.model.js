const { Schema, model } = require("mongoose");
const defaultUserImage = '../assets/logo.png'

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
    games: [{ type: Schema.Types.ObjectId, ref: "Games" }]
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
