require('dotenv').config();
const mongoose = require('mongoose');

// Import your models
const UpcomingEvent = require('./models/UpcomingEvent');
const PastEvent = require('./models/PastEvent');
const TeamMember = require('./models/TeamMember');

async function debugDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check upcoming events
    console.log('\n=== UPCOMING EVENTS ===');
    const upcomingEvents = await UpcomingEvent.find();
    console.log(`Found ${upcomingEvents.length} upcoming events:`);
    upcomingEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.date} - Status: ${event.status}`);
    });

    // Check past events
    console.log('\n=== PAST EVENTS ===');
    const pastEvents = await PastEvent.find();
    console.log(`Found ${pastEvents.length} past events:`);
    pastEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.date}`);
    });

    // Check team members
    console.log('\n=== TEAM MEMBERS ===');
    const teamMembers = await TeamMember.find();
    console.log(`Found ${teamMembers.length} team members:`);
    teamMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} - ${member.role}`);
    });

    // Check what collections exist
    console.log('\n=== ALL COLLECTIONS ===');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

debugDatabase();
