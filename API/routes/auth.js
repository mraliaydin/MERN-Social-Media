const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//Register
router.post("/register", async (req, res) => {
  //For async functions, write await

  try {
    //Create salt. Get the writen pass from the json and use salt to hash it.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    //We get data from request, json body
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and return respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    //We are using User model and use fineOne method because there is one unique email
    const user = await User.findOne({ email: req.body.email });

    //if there is no user
    //if you trigger it from postman with wrong email it will give 404 error
    !user && res.status(404).send("user not found");

    //compare entered pass(body.pass) and real pas(user.pass)
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    //if validPassword == False send an error
    !validPassword && res.status(400).send("Wrong password");

    //if email and pass is correct send 200 code and user
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Export for import in index.js
module.exports = router;
