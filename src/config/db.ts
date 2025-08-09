import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI environment variable is not defined.");
}

export const connectToDb = async (
  mongoUri = process.env.MONGO_URI as string
): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Successfully connected to MongoDB.");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Database connection error: ", error.message);
    }
    throw new Error("Something went wrong!");
  }
};
