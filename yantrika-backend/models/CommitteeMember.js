const { Schema, model } = require('mongoose');

const committeeMemberSchema = new Schema({
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  department:  { type: String },
  year:        { type: String }, // e.g., "First Year", "Second Year", etc.
}, { timestamps: true });

module.exports = model('CommitteeMember', committeeMemberSchema);