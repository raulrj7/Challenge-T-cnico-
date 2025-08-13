import request from 'supertest';
import express from 'express';
import mongoose, { Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userRouter from '../routes/user.routes';
import { User, IUser } from '../../models/users.model';
import bcrypt from 'bcrypt';

const mockUserId = new mongoose.Types.ObjectId();
const mockPassword = '123456';

jest.mock('../../middlewares/jwtMiddleware', () => ({
  jwtMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: mockUserId.toHexString(), name: 'Test User' };
    next();
  },
}));

let mongoServer: MongoMemoryServer;
const app = express();
app.use(express.json());
app.use('/users', userRouter);

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

describe('User routes', () => {
  let savedUser: IUser;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mockPassword, salt);

    savedUser = await new User({
      _id: mockUserId,
      name: 'Original Name',
      email: 'test@example.com',
      password: hashedPassword,
    }).save();
  });

  it('should get current user', async () => {
    const res = await request(app).get('/users/me');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(savedUser.name);
    expect(res.body.email).toBe(savedUser.email);
    expect(res.body.password).toBeUndefined();
  });

  it('should update user name', async () => {
    const res = await request(app)
      .put('/users/me')
      .send({ name: 'Updated Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Name updated successfully');
    expect(res.body.name).toBe('Updated Name');

    const userInDb = await User.findById(mockUserId);
    expect(userInDb!.name).toBe('Updated Name');
  });

  it('should update user password', async () => {
    const newPassword = 'newpassword';
    const res = await request(app)
      .put('/users/password')
      .send({ currentPassword: mockPassword, newPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Password updated successfully');

    const userInDb = await User.findById(mockUserId);
    const match = await bcrypt.compare(newPassword, userInDb!.password);
    expect(match).toBe(true);
  });

  it('should not update password with wrong current password', async () => {
    const res = await request(app)
      .put('/users/password')
      .send({ currentPassword: 'wrongpassword', newPassword: 'anotherpass' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Current password is incorrect');
  });

  it('should fail updating name if too short', async () => {
    const res = await request(app)
      .put('/users/me')
      .send({ name: 'A' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should fail updating password if too short', async () => {
    const res = await request(app)
      .put('/users/password')
      .send({ currentPassword: mockPassword, newPassword: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
