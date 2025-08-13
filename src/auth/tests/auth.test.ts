import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth.routes';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth routes', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('User registration', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should not register an existing email', async () => {
      await request(app).post('/auth/register').send(testUser);

      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email is already registered');
    });
  });

  describe('User login', () => {
    beforeEach(async () => {
      await request(app).post('/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should fail login with invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
