const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'declined'],
    default: 'pending'
  }
});

const Participant = mongoose.model('Participant', participantSchema);

function validateParticipant(participant) {
  const schema = Joi.object({
    user: Joi.objectId().required(),
    event: Joi.objectId().required(),
    status: Joi.string().valid('confirmed', 'pending', 'declined').required()
  });

  return schema.validate(participant);
}

exports.Participant = Participant;
exports.validate = validateParticipant;
