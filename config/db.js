const mongoose = require("mongoose");
// require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://shashankshekhar564:nanguinkshare@cluster0.6psb7td.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
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
