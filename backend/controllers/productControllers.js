import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// API for adding product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      date,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4];

    // checking for all data to add product
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !subCategory ||
      !sizes ||
      !bestseller ||
      !date
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // upload images to cloudinary
    // const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
    //   resource_type: "image",
    // });
    // const imageUrl = imageUpload.secure_url;

    let imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    console.log(
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      date
    );
    console.log(images);
    console.log(imageUrl);

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      image: imageUrl,
      sizes: JSON.parse(sizes),
      date: Date.now(),
    };

    const productDoctor = new productModel(productData);
    // console.log(productDoctor);
    await productDoctor.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for listing product
const listProduct = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for removing product
const removeProduct = async (req, res) => {};

// API for single product info
const singleProduct = async (req, res) => {};

export { addProduct, listProduct, removeProduct, singleProduct };
