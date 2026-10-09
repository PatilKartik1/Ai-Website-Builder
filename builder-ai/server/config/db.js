import mongoose from "mongoose";

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from the server .env file.");
  }

  mongoose.connection.on("connected", () => {
    console.log("Successfully connected to MongoDB.");
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    console.error("========== MONGODB ERROR ==========");
    console.error(err);
    console.error("===================================");
    throw err;
  }
}
