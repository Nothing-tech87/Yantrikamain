const mongoose = require('mongoose');
const { Schema } = mongoose;

const pastEventSchema = new Schema({
  title:        { type: String, required: true },
  date:         { type: Date,   required: true },
  description:  { type: String, required: true },
  badge:        { type: String },              // e.g. "1st Place Winner"
  media:        [String],                      // array of image/video URLs
  category:     { type: String, enum: ['Workshop','Competition','Seminar','Other'], default: 'Other' }
}, { timestamps: true });

module.exports = mongoose.model('PastEvent', pastEventSchema);
