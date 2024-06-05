const express = require('express');
const router = express.Router();
const { Participant, validate } = require('../models/participant');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Add a participant to an event
router.post('/', auth, async (req, res) => {
    /** #swagger.tags = ['Paricipant'] 
   *  #swagger.summary = 'Voeg deelnemer toe aan event'
  */
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const participant = new Participant(req.body);
  await participant.save();
  res.send(participant);
});

// Get all participants
router.get('/', [auth, admin], async (req, res) => {
        /** #swagger.tags = ['Paricipant'] 
   *  #swagger.summary = 'Get alle deelnemers'
  */
  const participants = await Participant.find().populate('user event');
  res.send(participants);
});

// Get all participants of a specific event
router.get('/event/:eventId', auth, async (req, res) => {
        /** #swagger.tags = ['Paricipant'] 
   *  #swagger.summary = 'Get alle deelenerms van een event'
  */
  const participants = await Participant.find({ event: req.params.eventId }).populate('user event');
  res.send(participants);
});

// Update a participant's status
router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const participant = await Participant.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      event: req.body.event,
      status: req.body.status
    },
    { new: true }
  ).populate('user event');

  if (!participant) return res.status(404).send('Participant not found');
  res.send(participant);
});

// Remove a participant from an event
router.delete('/:id', [auth, admin], async (req, res) => {
  /** #swagger.tags = ['Paricipant'] 
   *  #swagger.summary = 'Verwijder een deelenemer'
  */
  const participant = await Participant.findByIdAndRemove(req.params.id);
  if (!participant) return res.status(404).send('Participant not found');
  res.send(participant);
});

module.exports = router;
