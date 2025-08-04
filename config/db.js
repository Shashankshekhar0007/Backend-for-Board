const mongoose = require("mongoose");
require("dotenv").config();
const password = process.env.MONGO_URL;
const connectDB = async () => {
    try {
        await mongoose.connect(password, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
