// routes/auth.routes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const fileUploader = require("../config/cloudinary.config");
const mongoose = require("mongoose");


const router = express.Router();
const saltRounds = 10;

// POST /signup  - Creates a new user in the database////
router.post("/signup", fileUploader.single("userImage"), (req, res, next) => {
  const { username, email, password } = req.body;

  // Check if the email or password or name is provided as an empty string
  if (email === "" || password === "" || username === "") {
    res.status(400).json({ message: "Provide email, password and username" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ username })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If the email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      let userImage = undefined;
      if (req.hasOwnProperty("file")) {
        userImage = req.file.path;
      }

      // Create a new user in the database
      // We return a pending promise, which allows us to chain another `then`
      return User.create({
        email,
        password: hashedPassword,
        username,
        userImage
      });
    })

    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, username, userImage, games, _id } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { email, username, userImage, games, _id };

      // Send a json response containing the user object
      res.status(201).json({ user: user });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// POST /login
router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  // Check if email or password are provided as empty string
  if (username === "" || password === "") {
    res.status(400).json({ message: "Provide username and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ username })
    .populate({
      path: "games",
    })

    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, username, userImage, games } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, username, userImage, games };

        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "7d",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});

// POST /passwordupdate  - Change password
router.post('/passwordupdate', isAuthenticated, (req, res, next) => {

  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { email } = req.payload;
  
  if ( currentPassword === newPassword ) {
    res.status(400).json({ message: "New password must not match current one" });
    return;
  }

  // Check if the email or password or name is provided as an empty string 
  if ( currentPassword === '' ) {
    res.status(400).json({ message: "Provide a valid password" });
    return;
  }

  if ( newPassword !== confirmNewPassword || !currentPassword || !newPassword || !confirmNewPassword) {
    res.status(400).json({ message: "New passwords do not match" });
    return;
  }

  User.findOne({ email: email})
    .then( foundUser => {
      
      const passwordCorrect = bcrypt.compareSync(currentPassword, foundUser.password);
      
      if (!passwordCorrect ) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      foundUser.password = hashedPassword;

      return foundUser.save();
      
    }).then( updatedUser => {
      
      res.status(200).json({ message: "Password updated successfully" });

    }).catch((err)=>res.json(err))
});


// GET  /verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

router.get("/user/:userId", (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  // Each Game document has `comments` array holding `_id`s of Comment documents
  // We use .populate() method to get swap the `_id`s for the actual Comment documents
  User.findById(userId)
    .populate({
      path: "games",
    })
    .then((user) => res.status(200).json(user))
    .catch((err) => {
      console.log("Error while retrieving the user", err);
      res.status(500).json({ message: "Error while retrieving the user" });
    });
});

// PUT  /user/:userId  -  Updates a specific user by id
router.put(
  "/user/:userId",
  fileUploader.single("userImage"),
  (req, res, next) => {
    const { userId } = req.params;
    const updatedUser = {...req.body}

    if (req.hasOwnProperty("file")) {
      updatedUser.userImage = req.file.path;
    }

    User.findByIdAndUpdate(userId, updatedUser, { new: true })
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => {
        console.log("Error while updating the user", err);
        res.status(500).json({ message: "Error while updating the user" });
      });
  }
);



module.exports = router;
