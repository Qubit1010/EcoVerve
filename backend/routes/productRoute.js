import express from "express";
import {
  addProduct,
  listProduct,
  removeProduct,
  singleProduct,
} from "../controllers/productControllers.js";
import upload from "../middleware/multer.js";
// import upload from "../middlewares/multer.js";
// import authUser from "../middlewares/authUser.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  upload.fields(
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }
  ),
  addProduct
);
productRouter.post("/remove", removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProduct);

export default productRouter;
