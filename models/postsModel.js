const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLenghth: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  numberofLikes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'test'
});

const PostsModel = mongoose.model("Posts", postSchema);
module.exports = PostsModel;