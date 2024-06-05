const mongoose = require('mongoose');
const request = require('supertest');
const { Participant } = require('../models/participant');
const { User } = require('../models/user'); 
const { Event, validate: validateEvent } = require('../models/event');

const app = require('../app');

describe('ParticipantApp API Participants', () => {
    let token;
    let participant;
    let participantId;
    let userId;
    let eventId;
  
    beforeAll(async () => {
      // Connect to the database
      const db = 'mongodb://localhost/EventApp';
      await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
  
      // Create a user and an event
      let user = await User.findOne({ email: 'testuser@example.com' });
      if (!user) {
        user = new User({
          name: 'Test User',
          email: 'testuser@example.com',
          password: '12345',
          isAdmin: true,
        });
        await user.save();
      }
      token = user.generateAuthToken();
      userId = user._id;
  
      const event = new Event({
        title: 'Test Event',
        description: 'Test Event Description',
        date: new Date(),
        location: new mongoose.Types.ObjectId(),
        category: new mongoose.Types.ObjectId(),
        participants: [],
      });
      await event.save();
      eventId = event._id;
    });
  
    afterAll(async () => {
      await mongoose.connection.close();
    });
  
    beforeEach(async () => {
      // Create a participant before each test
      participant = new Participant({
        user: userId,
        event: eventId,
        status: 'confirmed',
      });
      await participant.save();
      participantId = participant._id;
    });
  
    // afterEach(async () => {
    //   // Clean up participants after each test
    //   await Participant.deleteMany({});
    // });
  
    describe('GET /api/participants', () => {
      it('should return all participants', async () => {
        const res = await request(app).get('/api/participants').set('x-auth-token', token);
        expect(res.status).toBe(200);
      });
    });
  
    describe('POST /api/participants', () => {
      const exec = async () => {
        return await request(app)
          .post('/api/participants')
          .set('x-auth-token', token)
          .send({
            user: userId,
            event: eventId,
            status: 'pending',
          });
      };
  
      it('should return 401 if client is not logged in', async () => {
        const res = await request(app)
          .post('/api/participants')
          .send({});
        expect(res.status).toBe(401);
      });
  
      it('should return 400 if participant data is invalid', async () => {
        const res = await request(app)
          .post('/api/participants')
          .set('x-auth-token', token)
          .send({});
        expect(res.status).toBe(400);
      });
  
      it('should save the participant if it is valid', async () => {
        const res = await exec();
        const participant = await Participant.find({ user: userId, event: eventId, status: 'pending' });
        expect(participant).not.toBeNull();
      });
  
      it('should return the participant if it is valid', async () => {
        const res = await exec();
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('status', 'pending');
      });
    });
  
  
    describe('PUT /api/participants/:id', () => {
      const exec = async () => {
        return await request(app)
          .put(`/api/participants/${participantId}`)
          .set('x-auth-token', token)
          .send({
            user: userId,
            event: eventId,
            status: 'confirmed',
          });
      };
  
      it('should return 401 if client is not logged in', async () => {
        const res = await request(app)
          .put(`/api/participants/${participantId}`)
          .send({
            user: userId,
            event: eventId,
            status: 'confirmed',
          });
        expect(res.status).toBe(401);
      });
  
      it('should return 400 if participant data is invalid', async () => {
        const res = await request(app)
          .put(`/api/participants/${participantId}`)
          .set('x-auth-token', token)
          .send({});
        expect(res.status).toBe(400);
      });
  
      it('should return 404 if participant id is invalid', async () => {
        const res = await request(app)
          .put(`/api/participants/${new mongoose.Types.ObjectId()}`)
          .set('x-auth-token', token)
          .send({
            user: userId,
            event: eventId,
            status: 'confirmed',
          });
        expect(res.status).toBe(404);
      });
  
      it('should update the participant if it is valid', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('_id', participantId.toHexString());
        expect(res.body).toHaveProperty('status', 'confirmed');
      });
    });
  
    describe('DELETE /api/participants/:id', () => {
      const exec = async () => {
        return await request(app)
          .delete(`/api/participants/${participantId}`)
          .set('x-auth-token', token)
          .send();
      };
  
      it('should return 401 if client is not logged in', async () => {
        const res = await request(app)
          .delete(`/api/participants/${participantId}`)
          .send();
        expect(res.status).toBe(401);
      });
  
      it('should return 404 if participant id is invalid', async () => {
        const res = await request(app)
          .delete(`/api/participants/${new mongoose.Types.ObjectId()}`)
          .set('x-auth-token', token)
          .send();
        expect(res.status).toBe(404);
      });
  
      it('should delete the participant if it exists', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('_id', participantId.toHexString());
  
        const deletedParticipant = await Participant.findById(participantId);
        expect(deletedParticipant).toBeNull();
      });
    });
  });
  