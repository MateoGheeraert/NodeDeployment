const Joi = require('joi');
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }]
});

const Event = mongoose.model('Event', eventSchema);

function validateEvent(event) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(1024).required(),
    date: Joi.date().required(),
    location: Joi.string().hex().length(24).required(),
    category: Joi.string().hex().length(24).required(),
    participants: Joi.array().items(Joi.string().hex().length(24))
  });

  return schema.validate(event);
}

exports.Event = Event;
exports.validate = validateEvent;
