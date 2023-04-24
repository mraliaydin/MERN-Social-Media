const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

//Update User
//We use put bc it is update
// "/:id" will allow to choose any user id
router.put("/:id", async (req, res) => {
  //chech if user id equals to the url param and if s/he is and admin
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    //if user wants to update his or her password get it and create new hash value then update body
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }

    //get the req body and up it into the model my using $set (if there is pass body will updated above inside if)
    try {
      //findByIdAndUpdate is method of the User model (this method will update user)
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated.");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can update only your account");
  }
});

//Delete User
router.delete("/:id", async (req, res) => {
  //chech if user id equals to the url param and if s/he is and admin
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      //findByIdAndDelete is the method of the User model (this method will delete user)
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted.");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});

//Get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    //We dont want to send password and updatedAt, we seperate them and just sent the rest of them
    //which are "other"
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Follow a user
router.put("/:id/follow", async (req, res) => {
  //Check users are same. A user cannot follow him/her self
  if (req.body.userId !== req.params.id) {
    try {
      //find users
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      //if currentUser is not following the user enter
      if (!user.followers.includes(req.body.userId)) {
        //Update followers and followings arrays
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });

        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You cant follow yourself");
  }
});

//Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  //Check users are same. A user cannot follow him/her self
  if (req.body.userId !== req.params.id) {
    try {
      //find users
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      //if currentUser is not following the user enter
      if (user.followers.includes(req.body.userId)) {
        //Update followers and followings arrays
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });

        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You dont follow this user");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You cant unfollow yourself");
  }
});

//Export for import in index.js
module.exports = router;
