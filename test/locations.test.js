const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const { Location } = require('../models/location');
const { User } = require('../models/user');

beforeAll(async () => {
  const db = 'mongodb://localhost/EventApp';
  await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('EventApp API Locations', () => {
    let token;

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
        } else {
            token = existingUser.generateAuthToken();
        }
    });

    describe('POST /api/locations', () => {
        it('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({ name: 'Test Location', address: 'Test Address' });
            expect(res.status).toBe(401);
        });

        it('should return 400 if location is invalid', async () => {
            const res = await request(app)
                .post('/api/locations')
                .set('x-auth-token', token)
                .send({});
            expect(res.status).toBe(400);
        });

        it('should save the location if it is valid', async () => {
            const res = await request(app)
                .post('/api/locations')
                .set('x-auth-token', token)
                .send({ name: 'Test Location', address: 'Test Address' });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'Test Location');
            expect(res.body).toHaveProperty('address', 'Test Address');
        });
    });

    describe('GET /api/locations', () => {
        it('should return all locations', async () => {
            const res = await request(app).get('/api/locations');
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/locations/:id', () => {
        it('should return a location if valid id is passed', async () => {
            const location = new Location({ name: 'Test Location', address: 'Test Address' });
            await location.save();

            const res = await request(app).get(`/api/locations/${location._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'Test Location');
            expect(res.body).toHaveProperty('address', 'Test Address');
        });

        it('should return 404 if no location with the given id exists', async () => {
            const res = await request(app).get(`/api/locations/${new mongoose.Types.ObjectId()}`);
            expect(res.status).toBe(404);
        });
    });
});
