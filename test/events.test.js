const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const { User, validate } = require('../models/user');
const { Event, validate: validateEvent } = require('../models/event');
const { Location, validate: validateEventLocation } = require('../models/location');
const { Category, validate: validateEventCategory } = require('../models/category');

beforeAll(async () => {
  const db = 'mongodb://localhost/EventApp';
  await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('EventApp API Events', () => {
    let token;
    let event;
    let eventId;
    let userId;
    let locationId;
    let categoryId;
  
    beforeEach(async () => {
      let existingUser = await User.findOne({ email: 'testuser@example.com' });
      if (!existingUser) {
        const user = new User({
          name: 'Test User',
          email: 'testuser@example.com',
          password: '12345',
          isAdmin: true,
        });
        await user.save();
        token = user.generateAuthToken();
        userId = user._id;
      } else {
        token = existingUser.generateAuthToken();
        userId = existingUser._id;
      }
  
      event = new Event({
        title: 'Test Event',
        description: 'Test Event Description',
        date: new Date(),
        location: new mongoose.Types.ObjectId(),
        category: new mongoose.Types.ObjectId(),
        participants: [],
      });
      await event.save();
      eventId = event._id;

      location = new Location({
        name: 'Test Location',
        address: 'Test street',
      });
      await location.save();
      locationId = location._id;

      category = new Category({
        name: 'Test category',
      });
      await category.save();
      categoryId = category._id;
    });
  
    describe('GET /api/events', () => {
      it('should return all events', async () => {
        const res = await request(app).get('/api/events').set('x-auth-token', token);
        expect(res.status).toBe(200);
      });
    });

    describe('GET /api/events/:id', () => {
        it('should return an event if valid id is passed', async () => {
          const res = await request(app).get(`/api/events/${eventId}`);
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('title', 'Test Event');
        });
    
        it('should return 404 if no event with the given id exists', async () => {
          const res = await request(app).get(`/api/events/${new mongoose.Types.ObjectId()}`);
          expect(res.status).toBe(404);
        });
    });
    
    describe('POST /api/events', () => {
        const exec = async () => {
          return await request(app)
            .post('/api/events')
            .set('x-auth-token', token)
            .send({
              title: 'New Event',
              description: 'New Event Description',
              date: new Date(),
              location: locationId,
              category: categoryId,
              participants: [],
            });
        };
    
        it('should return 401 if client is not logged in', async () => {
          token = '';
          const res = await exec();
          expect(res.status).toBe(401);
        });
    
        it('should return 400 if event is invalid', async () => {
          const res = await request(app)
            .post('/api/events')
            .set('x-auth-token', token)
            .send({});
          expect(res.status).toBe(400);
        });
    
        it('should save the event if it is valid', async () => {
          const res = await exec();
          const event = await Event.find({ title: 'New Event' });
          expect(event).not.toBeNull();
        });
    
        it('should return the event if it is valid', async () => {
          const res = await exec();
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('title', 'New Event');
        });
      });
    
      describe('PUT /api/events/:id', () => {
        const exec = async () => {
          return await request(app)
            .put(`/api/events/${eventId}`)
            .set('x-auth-token', token)
            .send({
              title: 'Updated Event',
              description: 'Updated Event Description',
              date: new Date(),
              location: locationId,
              category: categoryId,
              participants: [],
            });
        };
    
        it('should return 401 if client is not logged in', async () => {
          token = '';
          const res = await exec();
          expect(res.status).toBe(401);
        });
    
        it('should return 400 if event is invalid', async () => {
          const res = await request(app)
            .put(`/api/events/${eventId}`)
            .set('x-auth-token', token)
            .send({});
          expect(res.status).toBe(400);
        });
    
        it('should return 404 if event id is invalid', async () => {
          const res = await request(app)
            .put(`/api/events/${new mongoose.Types.ObjectId()}`)
            .set('x-auth-token', token)
            .send({
              title: 'Updated Event',
              description: 'Updated Event Description',
              date: new Date(),
              location: locationId,
              category: categoryId,
              participants: [],
            });
          expect(res.status).toBe(404);
        });
    
        it('should update the event if it is valid', async () => {
          const res = await exec();
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('_id', eventId.toHexString());
          expect(res.body).toHaveProperty('title', 'Updated Event');
        });
      });

      describe('DELETE /api/events/:id', () => {
        const exec = async () => {
          return await request(app)
            .delete(`/api/events/${eventId}`)
            .set('x-auth-token', token)
            .send();
        };
    
        it('should return 401 if client is not logged in', async () => {
          token = '';
          const res = await exec();
          expect(res.status).toBe(401);
        });
    
        it('should return 404 if event id is invalid', async () => {
          const res = await request(app)
            .delete(`/api/events/${new mongoose.Types.ObjectId()}`)
            .set('x-auth-token', token)
            .send();
          expect(res.status).toBe(404);
        });
    
        it('should delete the event if it exists', async () => {
          const res = await exec();
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('_id', eventId.toHexString());
    
          const deletedEvent = await Event.findById(eventId);
          expect(deletedEvent).toBeNull();
        });
      })
  });
