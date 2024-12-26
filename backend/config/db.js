import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log(
			`  \x1b[32m➜\x1b[0m  \x1b[2m\x1b[1mMongoDB:\x1b[0m \x1b[2mconnected successfully\x1b[0m`
		);
	} catch (error) {
		console.log("Error connecting to MONGODB", error);
		process.exit(1);
	}
};
