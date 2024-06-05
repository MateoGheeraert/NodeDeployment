const express = require('express');
const router = express.Router();
const { Event, validate } = require('../models/event');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create a new event
router.post('/', [auth, admin], async (req, res) => {
    /** #swagger.tags = ['Event'] 
   *  #swagger.summary = 'Post een event'
  */
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const event = new Event(req.body);
  await event.save();
  res.send(event);
});

// Get all events
router.get('/', async (req, res) => {
        /** #swagger.tags = ['Event'] 
   *  #swagger.summary = 'Get alle event'
  */
  const events = await Event.find().populate('location category participants');
  res.send(events);
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
 /** #swagger.tags = ['Event'] 
   *  #swagger.summary = 'Get event door id'
  */
  const event = await Event.findById(req.params.id).populate('location category participants');
  if (!event) return res.status(404).send('Event not found');
  res.send(event);
});

// Update an event
router.put('/:id', [auth, admin], async (req, res) => {
  /** #swagger.tags = ['Event'] 
   *  #swagger.summary = 'Update een event'
  */
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('location category participants');
  if (!event) return res.status(404).send('Event not found');
  res.send(event);
});

// Delete an event
router.delete('/:id', [auth, admin], async (req, res) => {
    /** #swagger.tags = ['Event'] 
   *  #swagger.summary = 'Delete een event'
  */
  const event = await Event.findByIdAndRemove(req.params.id);
  if (!event) return res.status(404).send('Event not found');
  res.send(event);
});

// Add a participant to an event
router.post('/:id/participants', auth, async (req, res) => {
   /** #swagger.tags = ['Event'] 
   *  #swagger.summary = 'Add een deelnemer aan event'
  */
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).send('Event not found');

  const user = req.user._id;
  if (event.participants.includes(user)) return res.status(400).send('User already participating');

  event.participants.push(user);
  await event.save();
  res.send(event);
});

// Remove a participant from an event
router.delete('/:id/participants/:userId', [auth, admin], async (req, res) => {
  /** #swagger.tags = ['Event'] 
   *  #swagger.summary = 'Verwijder deelnemer van event'
  */
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).send('Event not found');

    const user = req.params.userId;

    console.log('Current participants:', event.participants);
    console.log('User to remove:', user);

    event.participants = event.participants.filter(p => p.toString() !== user);

    console.log('Updated participants:', event.participants);

    await event.save();
    res.send(event);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
