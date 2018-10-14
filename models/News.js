var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Setting up schema constructor 
var NewsSchema = new Schema({

  title: {
    type: String,
    required: true,
    unique: true
  },

  link: {
    type: String,
    required: true,
    unique: true
  },

  image: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String,
    required: true,
    unique: true
  },

  saved: {
    type: Boolean,
    default: false,
    required: true
  },

  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Notes"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var News = mongoose.model("News", NewsSchema);

// Export the Article model
module.exports = News;
