const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  per: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Hero", heroSchema);
