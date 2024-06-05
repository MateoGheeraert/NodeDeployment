const Joi = require('joi');
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  address: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  }
});

const Location = mongoose.model('Location', locationSchema);

function validateLocation(location) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    address: Joi.string().min(5).max(1024).required()
  });

  return schema.validate(location);
}

exports.Location = Location;
exports.validate = validateLocation;
