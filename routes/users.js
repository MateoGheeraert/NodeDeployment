const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
        /** #swagger.tags = ['User'] 
   *  #swagger.summary = 'Registreer nieuwe gebruiker'
  */
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send({ message: 'User already registered.' });
  
  user = new User(req.body);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  res.send(user);
});

// Login
router.post('/login', async (req, res) => {
            /** #swagger.tags = ['User'] 
   *  #swagger.summary = 'Log een user in'
  */
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.send({ token });
});

// Get current user
router.get('/me', auth, async (req, res) => {
            /** #swagger.tags = ['User'] 
   *  #swagger.summary = 'Get current user'
  */
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

module.exports = router;
