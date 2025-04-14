import mongoose from "mongoose";
import { ENV_VARS } from "./envVars";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV_VARS.MONGO_URI!);
    console.log(`MongoDB connnected :${conn.connection.host}`);
  } catch (error) {
    console.log(`Error connection to MongoDB: ${error}`);
    process.exit(1);
  }
};
