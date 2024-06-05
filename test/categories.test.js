const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const { Category } = require('../models/category');
const { User, validate } = require('../models/user');

beforeAll(async () => {
  const db = 'mongodb://localhost/EventApp';
  await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('EventApp API Categories', () => {
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
          userId = user._id;
        } else {
          token = existingUser.generateAuthToken();
        }
    });

    describe('POST /api/categories', () => {
        it('should return 401 if user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/categories')
                .send({ name: 'Test Category' });
            expect(res.status).toBe(401);
        });

        it('should return 401 if user is not an admin', async () => {
            // Simulate a non-admin user by not providing authentication
            const res = await request(app)
                .post('/api/categories')
                .send({ name: 'Test Category' });
            expect(res.status).toBe(401);
        });

        it('should return 400 if category is invalid', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('x-auth-token', 'valid_auth_token')
                .send({});
            expect(res.status).toBe(400);
        });

        it('should save the category if it is valid', async () => {
            const res = await request(app)
                .post('/api/categories')
                .set('x-auth-token', token)
                .send({ name: 'Test Categorie' });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'Test Categorie');
        });
    });

    describe('GET /api/categories', () => {
        it('should return all categories', async () => {
            const res = await request(app).get('/api/categories');
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/categories/:id', () => {
        it('should return a category if valid id is passed', async () => {
            const category = new Category({ name: 'Test Category' });
            await category.save();

            const res = await request(app).get(`/api/categories/${category._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'Test Category');
        });

        it('should return 404 if no category with the given id exists', async () => {
            const res = await request(app).get(`/api/categories/${new mongoose.Types.ObjectId()}`);
            expect(res.status).toBe(404);
        });
    });
});
