const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  title: { type: String },
  body: { type: String }
});
NoteSchema.methods.truncateBody = function() {
  if (this.body && this.body.length > 75) {
    return this.body.substring(0, 70) + " ...";
  }
  return this.body;
};

const VisitSchema = new mongoose.Schema({
  path: { type: String},
  date: { type: Date},
  userAgent: { type: String },
  count: { type: Number}
});

module.exports = { 
  VisitModel : mongoose.model("Visit",VisitSchema), 
  NoteModel : mongoose.model("Note", NoteSchema)
};
