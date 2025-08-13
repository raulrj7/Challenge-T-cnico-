import request from 'supertest';
import express from 'express';
import mongoose, { Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import reservationRouter from '../routes/reservation.routes';
import { Event, IEvent } from '../../models/events.model';
import { Reservation, IReservation } from '../../models/reservations.model';

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
app.use('/reservations', reservationRouter);

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

describe('Reservation routes', () => {
  let savedEvent: IEvent & { _id: mongoose.Types.ObjectId };
  let savedReservation: IReservation & { _id: mongoose.Types.ObjectId };

  beforeEach(async () => {
    savedEvent = await new Event({
      name: 'Test Event',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: 'Test Location',
      capacity: 5,
      availableCapacity: 5,
      creator: mockUserId,
    }).save() as IEvent & { _id: mongoose.Types.ObjectId };
  });

  it('should reserve a spot', async () => {
    const res = await request(app)
      .post('/reservations')
      .send({ event: savedEvent._id.toString() });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBe(mockUserId.toHexString());
    expect(res.body.event).toBe(savedEvent._id.toString());
    savedReservation = res.body;
  });

  it('should not allow duplicate reservations', async () => {
    await request(app)
      .post('/reservations')
      .send({ event: savedEvent._id.toString() });

    const res = await request(app)
      .post('/reservations')
      .send({ event: savedEvent._id.toString() });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('You already have a reservation for this event');
  });

  it('should cancel a reservation', async () => {
    const createRes = await request(app)
      .post('/reservations')
      .send({ event: savedEvent._id.toString() });

    const res = await request(app)
      .post('/reservations/cancel')
      .send({ idReservation: createRes.body._id.toString() });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Reservation cancelled successfully');
  });

  it('should list user reservations', async () => {
    await request(app)
      .post('/reservations')
      .send({ event: savedEvent._id.toString() });

    const res = await request(app)
      .get('/reservations/my-reservations');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].user).toBe(mockUserId.toHexString());
    expect(res.body[0].event._id).toBe(savedEvent._id.toString());
  });
});
