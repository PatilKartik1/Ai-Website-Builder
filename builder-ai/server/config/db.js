import mongoose from "mongoose";

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from the server .env file.");
  }

  mongoose.connection.on("connected", () => {
    console.log("Successfully connected to MongoDB.");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  try {
    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 15000,
      family: 4,
    });

    console.log("MongoDB connection established!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}
