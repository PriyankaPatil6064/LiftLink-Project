import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set in environment variables.");
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000, // 10 seconds to select a server
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  };

  let retries = 3;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries--;
      console.error(`MongoDB Connection Error: ${error.message}`);
      if (retries > 0) {
        console.log(`   Retrying in 3 seconds... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.error("❌ Could not connect to MongoDB after 3 attempts. Exiting.");
        process.exit(1);
      }
    }
  }
};

export default connectDB;
