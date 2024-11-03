import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrder,
  updateStatus,
  verifyStripe,
} from "../controllers/orderController.js";
import authUser from "../middleware/auth.js";
import authAdmin from "../middleware/authAdmin.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", authAdmin, allOrders);
orderRouter.post("/status", authAdmin, updateStatus);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User Feature
orderRouter.post("/userorders", authUser, userOrder);

// verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);

export default orderRouter;
