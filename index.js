const express = require('express');
const connectDB = require('./config/db');
const app = express();
const registerRoute = require('./routes/registerRoute');
const PostsRoute = require('./controllers/postController')
const cors = require('cors');
const userRoutes = require("./routes/userRoutes");

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/user', userRoutes);
app.use('/register', registerRoute);
app.use('/post', PostsRoute);
app.use('/api/getpost', PostsRoute);

connectDB();


app.listen(5000, () => {
  console.log("Server is running on port 5000");

});