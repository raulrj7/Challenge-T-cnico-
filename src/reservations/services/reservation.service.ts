import mongoose from 'mongoose';
import { Reservation, IReservation } from '../../models/reservations.model';
import { Event } from '../../models/events.model';

export const reservationService = {
  async reserveSpot(userId: string, eventId: string): Promise<IReservation | null> {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    if (event.availableCapacity <= 0) throw new Error('No available spots');

    const existingReservation = await Reservation.findOne({
      user: userId,
      event: eventId,
      status: { $ne: 'cancelled' }
    });

    if (existingReservation) throw new Error('You already have a reservation for this event');

    const reservation = new Reservation({
      user: new mongoose.Types.ObjectId(userId),
      event: new mongoose.Types.ObjectId(eventId),
      status: 'active'
    });

    await reservation.save();

    event.availableCapacity -= 1;
    await event.save();

    return reservation;
  },

  async cancelReservation(userId: string, reservationId: string) {
    const reservation = await Reservation.findOne({
      _id: reservationId,
      user: new mongoose.Types.ObjectId(userId)
    });

    if (!reservation) {
      throw new Error('Reservation not found or does not belong to user');
    }

    if ((reservation as any).status === 'cancelled') {
      throw new Error('Reservation already cancelled');
    }

    const event = await Event.findById(reservation.event);
    if (!event) {
      throw new Error('Event not found');
    }

    (reservation as any).status = 'cancelled';
    await reservation.save();

    event.availableCapacity += 1;
    await event.save();

    return { message: 'Reservation cancelled and spot released' };
  },

  async listReservations(userId: string) {
    return Reservation.find({ user: userId }).populate('event');
  }
};
