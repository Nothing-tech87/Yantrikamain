const mongoose = require('mongoose');
const { Schema } = mongoose;

const upcomingEventSchema = new Schema({
  title:           { type: String,  required: true },
  type:            { type: String,  enum: ['Workshop','Competition','Seminar','Other'], default: 'Other' },
  description:     { type: String,  required: true },
  date:            { type: Date,    required: true },
  startTime:       { type: String,  required: true },  // e.g. "14:00"
  endTime:         { type: String,  required: true },  // e.g. "18:00"
  location:        { type: String,  required: true },
  registrationLink:{ type: String },
  status:          { type: String,  enum: ['open','closed','cancelled'], default: 'open' },
  imageUrl:        { type: String },
  capacity:        { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('UpcomingEvent', upcomingEventSchema);
