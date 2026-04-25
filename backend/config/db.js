import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('Error connecting to MongoDB: MONGO_URI is missing in backend/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected:${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Check your Atlas IP whitelist, database username/password, and connection string.');
    process.exit(1);
  }
};

export default connectDB;
