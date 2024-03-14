const express = require("express");
const { login, signupAsUser, signupAsDealer,logout ,profile,updatePassword}  = require("../controllers/userController");

const userRouter = express.Router();

userRouter.post("/signup1",signupAsUser);
userRouter.post("/signup2",signupAsDealer);
userRouter.post("/login",login);
userRouter.get("/logout",logout);
userRouter.get("/profile",profile);
userRouter.post("/updatepassword",updatePassword);

module.exports = userRouter;