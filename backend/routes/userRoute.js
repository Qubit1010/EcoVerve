import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
} from "../controllers/userControllers.js";
// import upload from "../middlewares/multer.js";
// import authUser from "../middlewares/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", loginAdmin);

export default userRouter;
