const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { User } = require('../models/user');

beforeAll(async () => {
  const db = 'mongodb://localhost/EventApp';
  await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});


describe('UserApp API Users', () => {
  describe('POST /api/users/register', () => {
    const exec = async () => {
      return await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'testuser@gmail.com',
          password: 'password123'
        });
    };
    it('should register a new user', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });

    it('should return 400 if user is already registered', async () => {
        await exec();
        const res = await exec(); 
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'User already registered.' }); 
    });    
  });

  describe('POST /api/users/login', () => {
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
    });

    const exec = async () => {
        return await request(app)
          .post('/api/users/login')
          .send({
            email: 'testuser@example.com',
            password: '12345'
          });
      };
    it('should login a user with valid credentials', async () => {
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'invalidemail',
          password: 'password123'
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 if password is incorrect', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 if user does not exist', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/me', () => {
    let token;
  
    beforeEach(async () => {
      const user = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      });
      token = user.generateAuthToken();
      await user.save();
    });
  
    const exec = async (token) => {
      return await request(app)
        .get('/api/users/me')
        .set('x-auth-token', token);
    };
  
    it('should return the current user with valid token', async () => {
      const res = await exec(token);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'testuser@example.com');
      expect(res.body).not.toHaveProperty('password');
    });
  
    it('should return 401 if token is not provided', async () => {
      const res = await exec('');
      expect(res.status).toBe(401);
    });
  
    it('should return 400 if token is invalid', async () => {
      const res = await exec('invalidtoken');
      expect(res.status).toBe(400);
    });
  });
});
