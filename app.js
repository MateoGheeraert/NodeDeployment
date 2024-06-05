const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json');

// Routes
const categories = require("./routes/categories");
const events = require("./routes/events");
const locations = require("./routes/locations");
const participants = require("./routes/participants");
const users = require("./routes/users");
const auth = require('./routes/auth');

// Connect to MongoDB
mongoose.connect('mongodb+srv://Beheerder:Hallo1234@event.8kq0tad.mongodb.net/Event')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'));

const app = express();

// Middleware
app.use(express.json());

// API Routes
app.use('/api/categories', categories);
app.use('/api/events', events);
app.use('/api/locations', locations);
app.use('/api/participants', participants);
app.use('/api/users', users);
app.use('/api/auth', auth);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Check for jwtPrivateKey
if (!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey not defined');
    process.exit(1);
}

module.exports = app;
