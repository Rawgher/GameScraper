var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var NotesSchema = new Schema({

  body: {
    type: String,
    required: true
  },
  
  name: {
    type: String,
    required: true
  }
});

// This creates our model from the above schema, using mongoose's model method
var Notes = mongoose.model("Notes", NotesSchema);

// Export the Note model
module.exports = Notes;
