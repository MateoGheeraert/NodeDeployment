const express = require('express');
const router = express.Router();
const { Location, validate } = require('../models/location');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create a new location
router.post('/', [auth, admin], async (req, res) => {
  /** #swagger.tags = ['Location'] 
   *  #swagger.summary = 'Post een nieuwe locatie'
  */
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message); // Ensure return here

  const location = new Location(req.body);
  await location.save();
  res.send(location);
});

// Get all locations
router.get('/', async (req, res) => {
  /** #swagger.tags = ['Location'] 
   *  #swagger.summary = 'Get alle locaties'
  */
  const locations = await Location.find();
  res.send(locations);
});

// Get a single location by ID
router.get('/:id', async (req, res) => {
  /** #swagger.tags = ['Location'] 
   *  #swagger.summary = 'Get locatie door id'
  */
  const location = await Location.findById(req.params.id);
  if (!location) return res.status(404).send('Location not found'); // Ensure return here
  res.send(location);
});

module.exports = router;
