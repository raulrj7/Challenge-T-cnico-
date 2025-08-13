import request from 'supertest';
import express from 'express';
import mongoose, { Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import eventRouter from '../routes/events.routes';

const mockUserId = new mongoose.Types.ObjectId();

jest.mock('../../middlewares/jwtMiddleware', () => ({
  jwtMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: mockUserId.toHexString(), name: 'Test User' };
    next();
  },
}));

const UserSchema = new Schema({ name: String });
mongoose.model('User', UserSchema);

let mongoServer: MongoMemoryServer;
const app = express();
app.use(express.json());
app.use('/events', eventRouter);

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { dbName: 'test' });
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  await mongoServer.stop();
});

describe('Event routes', () => {
  const testEvent = {
    name: 'Test Event',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    location: 'Test Location',
    capacity: 100
  };

  describe('Create event', () => {
    it('should create a new event', async () => {
      const res = await request(app).post('/events').send(testEvent);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(testEvent.name);
      expect(res.body.availableCapacity).toBe(testEvent.capacity);
      expect(res.body._id).toBeDefined();
      expect(res.body.creator).toBeDefined();
    });
  });

  describe('List events', () => {
    beforeEach(async () => {
      await request(app).post('/events').send(testEvent);
    });

    it('should list all events', async () => {
      const res = await request(app).get('/events');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toBe(testEvent.name);
    });

    it('should list events for a user', async () => {
      const res = await request(app).get('/events/my-events');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].creator).toBeDefined();
    });
  });
});
