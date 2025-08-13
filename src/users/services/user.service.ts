import { User, IUser } from '../../models/users.model';
import bcrypt from 'bcrypt';

export const userService = {
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-password').exec();
  },

  async updateName(userId: string, newName: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) return null;
    user.name = newName;
    return user.save();
  },

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    return user.save();
  }
};
