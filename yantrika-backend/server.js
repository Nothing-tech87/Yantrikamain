require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const TeamMember = require('./models/TeamMember');
const CommitteeMember = require('./models/CommitteeMember'); 
const UpcomingEvent = require('./models/UpcomingEvent');
const PastEvent    = require('./models/PastEvent');
const nodemailer = require('nodemailer');         // Optional: email notifications
const Message     = require('./models/Message');  // ← import your new model



const app = express();
app.use(cors());
app.use(express.json());

// ——— CONNECT TO MONGO —————————————————————————
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// ——— TEAM MEMBER ROUTES —————————————————————————

// GET all team members
app.get('/api/team', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new team member
app.post('/api/team', async (req, res) => {
  try {
    const member = new TeamMember(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (update) a team member
app.put('/api/team/:id', async (req, res) => {
  try {
    const updated = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a team member
app.delete('/api/team/:id', async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ——— COMMITTEE MEMBER ROUTES —————————————————————————

// GET all committee members
app.get('/api/committee', async (req, res) => {
  try {
    const members = await CommitteeMember.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new committee member
app.post('/api/committee', async (req, res) => {
  try {
    const newMember = new CommitteeMember(req.body);
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (update) a committee member
app.put('/api/committee/:id', async (req, res) => {
  try {
    const updated = await CommitteeMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a committee member
app.delete('/api/committee/:id', async (req, res) => {
  try {
    await CommitteeMember.findByIdAndDelete(req.params.id);
    res.json({ message: 'Committee member deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ——————————————————————————
//  Upcoming Events Endpoints
// ——————————————————————————
app.get('/api/upcoming-events', async (req, res) => {
  try {
    // 1. Compute midnight today in server local time (or UTC)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Query for date >= start‑of‑today
    const events = await UpcomingEvent
      .find({ date: { $gte: startOfToday }, status: 'open' })
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/upcoming-events', async (req, res) => {
  try {
    const ev = new UpcomingEvent(req.body);
    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// (You can add PUT / DELETE similarly…)

// ——————————————————————————
//    Past Events Endpoints
// ——————————————————————————
app.get('/api/past-events', async (req, res) => {
  try {
    const events = await PastEvent
      .find()
      .sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/past-events', async (req, res) => {
  try {
    const ev = new PastEvent(req.body);
    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ——————————————————————————
//  Contact Form Endpoints
// ——————————————————————————

/**
 * POST /api/contact
 * Receives a message, saves to MongoDB, and optionally emails ADMIN_EMAIL.
 */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1) persist in DB
    const saved = await Message.create({ name, email, subject, message });

    // 2) optional: email notification to ADMIN_EMAIL
    if (process.env.SMTP_HOST && process.env.ADMIN_EMAIL) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: `"Yantrika Site" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📬 New message: ${subject}`,
        text: `
You’ve got a new message from ${name} <${email}>:

${message}
        `
      });
    }

    return res.json({
      status: 'ok',
      message: 'Thank you! Your message has been received.'
    });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

/**
 * GET /api/messages
 * Returns all messages, newest first.
 * Protected by X-ADMIN-KEY header.
 */
app.get('/api/messages', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const all = await Message.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ——— START SERVER —————————————————————————
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
