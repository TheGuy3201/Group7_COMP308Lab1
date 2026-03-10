// mongoose.js is a configuration file that connects to MongoDB 
// using Mongoose. It reads the MONGO_URI environment variable 
// from the .env file and connects to the MongoDB database using 
// the Mongoose connect method. If the connection is successful, 
// it logs a message to the console. If there is an error connecting
//  to MongoDB, it logs an error message and exits the process.
import mongoose from 'mongoose';
import config from './config.js';

// Mongoose connection configuration
const configureMongoose = async () => {
  try {
    await mongoose.connect(config.db);
    console.log(`Connected to MongoDB at ${config.db}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

export default configureMongoose;
