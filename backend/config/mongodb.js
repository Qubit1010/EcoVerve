import mongoose from "mongoose";

const connectDB = async () => {

  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  
  // console.log(process.env.MONGODB_URI);
};

export default connectDB;
