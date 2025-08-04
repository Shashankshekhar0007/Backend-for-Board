const express = require('express');
const connectDB = require('./config/db');
const app = express();
const registerRoute = require('./routes/registerRoute');
const cors = require('cors');
app.use(cors());


connectDB();

app.use('/register', registerRoute);
app.listen(5000, () => {
  console.log("Server is running on port 5000");

});