const { Schema, model } = require('mongoose');

const teamMemberSchema = new Schema({
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  imageUrl:    { type: String },
  githubLink:  { type: String },
  linkedIn:    { type: String },
  email:       { type: String },
  department:  { type: String },
  branch:      { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = model('TeamMember', teamMemberSchema);
