const Joi = require('joi');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');


router.post('/', async (req, res) => {
      /** #swagger.tags = ['Authentication'] 
   *  #swagger.summary = 'Authenticatie'
  */
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Invalid user or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword) return res.status(400).send('Invalid email or password');

    const token = user.generateAuthToken();

    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']))

});

function validate(req){
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).email().required(),
        password: Joi.string().min(5).max(1024).required(),
    });
    return schema.validate(req);
}

module.exports = router;