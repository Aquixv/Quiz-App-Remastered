import mongoose from 'mongoose'
import dotenv from 'dotenv'

mongoose.connect(process.env.URI as string)
    .then(() => console.log("MongoDB Connected! 🚀"))
    .catch((err) => {
        console.error("Database Connection Error:", err.message);
        console.log("Tip: Check if your IP address is whitelisted in MongoDB Atlas.");
    });

export default mongoose