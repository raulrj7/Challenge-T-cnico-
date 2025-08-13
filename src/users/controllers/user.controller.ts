import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../../types/express';

export const userController = {
  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const user = await userService.getUserById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(user);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async updateName(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { name } = req.body;

      const updatedUser = await userService.updateName(userId, name);
      if (!updatedUser) return res.status(404).json({ message: 'User not found' });

      res.json({ message: 'Name updated successfully', name: updatedUser.name });
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { currentPassword, newPassword } = req.body;

      await userService.updatePassword(userId, currentPassword, newPassword);

      res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
