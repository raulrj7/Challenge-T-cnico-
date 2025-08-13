import { Response } from 'express';
import { reservationService } from '../services/reservation.service';
import { AuthenticatedRequest } from '../../types/express';

export const reservationController = {
  async reserveSpot(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { event } = req.body;

      const reservation = await reservationService.reserveSpot(userId, event);

      res.status(201).json(reservation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to reserve spot' });
    }
  },

  async cancelReservation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { idReservation } = req.body;

      await reservationService.cancelReservation(userId, idReservation);

      res.json({ message: 'Reservation cancelled successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to cancel reservation' });
    }
  },

  async listReservations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const reservations = await reservationService.listReservations(userId);

      res.json(reservations);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to list reservations' });
    }
  }
};
