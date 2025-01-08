import mongoose from "mongoose";

// This function connects to the MongoDB database using mongoose.
// It uses an async function to handle the asynchronous nature of the database connection.
export const connectDB = async () => {
    try {
        // Attempt to connect to the MongoDB database using the URI stored in the environment variable.
        await mongoose.connect(process.env.MONGODB_URI);
        
        // If the connection is successful, log a success message to the console with some styling.
        console.log(
            `  \x1b[32m➜\x1b[0m  \x1b[2m\x1b[1mMongoDB:\x1b[0m \x1b[2mconnected successfully\x1b[0m`
        );
    } catch (error) {
        // If there is an error during the connection, log the error message to the console.
        console.log("Error connecting to MONGODB", error);
        
        // Exit the process with a failure code.
        process.exit(1);
    }
};
