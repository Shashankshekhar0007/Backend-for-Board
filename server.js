const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const connectToDB = require('./config/db')
const { Server } = require("socket.io");
const http = require("http");
const Canvas = require("./models/CanvasModel");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const SECRET_KEY = process.env.SECRET_KEY;


const userRoutes = require("./routes/userRoutes");
const canvasRoutes = require("./routes/CanvasRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "https://ink-share-app.vercel.app/",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/canvas", canvasRoutes);


connectToDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://ink-share-app.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});

const upload = multer({
  dest: path.join(__dirname, "uploads/"),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

app.post("/extract-text", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const pythonScriptPath = path.resolve(__dirname, "../InkShare-App/app.py");
  const imagePath = path.resolve(req.file.path);

  // console.log("Python script path:", pythonScriptPath);
  // console.log("Image path:", imagePath);

  exec(`python "${pythonScriptPath}" "${imagePath}"`, (error, stdout, stderr) => {
    // console.log("stdout:", stdout);
    // console.log("stderr:", stderr);

    if (error) {
      console.error("Error executing script:", error);
      return res.status(500).json({ error: error.message });
    }

    if (stderr) {
      console.error("Script error:", stderr);
      return res.status(500).json({ error: stderr });
    }

    res.json({ text: stdout.trim() });
  });
});

let canvasData = {};
let i = 0;
// ...existing code...

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinCanvas", async ({ canvasId }) => {
    console.log("Joining canvas:", canvasId);
    try {
      const authHeader = socket.handshake.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No token provided.");
        socket.emit("unauthorized", { message: "Access Denied: No Token" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, SECRET_KEY);
      const userId = decoded.userId;

      // Fix: Extract string ID if canvasId is an object
      const canvasIdStr = typeof canvasId === 'object' ? canvasId.id : String(canvasId);

      const canvas = await Canvas.findById(canvasIdStr);
      if (!canvas || (String(canvas.owner) !== String(userId) && !canvas.shared.includes(userId))) {
        console.log("Unauthorized access.");
        socket.emit("unauthorized", { message: "You are not authorized to join this canvas." });
        return;
      }

      socket.join(canvasIdStr);
      console.log(`User ${socket.id} joined canvas ${canvasIdStr}`);

      if (canvasData[canvasIdStr]) {
        socket.emit("loadCanvas", canvasData[canvasIdStr]);
      } else {
        socket.emit("loadCanvas", canvas.elements);
      }
    } catch (error) {
      console.error("Join Canvas Error:", error);
      socket.emit("error", { message: "An error occurred while joining the canvas." });
    }
  });

  socket.on("drawingUpdate", async ({ canvasId, elements }) => {
    try {
      // Fix: Extract string ID if canvasId is an object
      const canvasIdStr = typeof canvasId === 'object' ? canvasId.id : String(canvasId);

      canvasData[canvasIdStr] = elements;
      socket.to(canvasIdStr).emit("receiveDrawingUpdate", elements);

      const canvas = await Canvas.findById(canvasIdStr);
      if (canvas) {
        await Canvas.findByIdAndUpdate(
          canvasIdStr,
          { elements },
          { new: true }
        );
      }
    } catch (error) {
      console.error("Drawing Update Error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
