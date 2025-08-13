import { Event, IEvent } from '../../models/events.model';
import { Reservation } from '../../models/reservations.model';

export const eventService = {
  async createEvent(data: Partial<IEvent>) {
    if (data.capacity !== undefined && data.availableCapacity === undefined) {
      data.availableCapacity = data.capacity;
    }

    if (!data.creator) {
      throw new Error('Creator is required');
    }

    const event = new Event(data);
    return event.save();
  },

  async listEvents() {
    return Event.find().populate('creator', 'name email').exec();
  },

  async getEventById(id: string) {
    return Event.findById(id).exec();
  },

  async updateEvent(id: string, userId: string, changes: Partial<IEvent>) {
    const event = await Event.findOne({ _id: id, creator: userId });
    if (!event) return null;

    if (changes.capacity !== undefined && changes.capacity !== event.capacity) {
      const activeReservations = event.capacity - event.availableCapacity;
      if (changes.capacity < activeReservations) {
        throw new Error(
          `Capacity (${changes.capacity}) cannot be less than active reservations (${activeReservations})`
        );
      }
      changes.availableCapacity = changes.capacity - activeReservations;
    } else {
      changes.availableCapacity = event.availableCapacity;
    }

    Object.keys(changes).forEach((key) => {
      if (key !== 'creator') {
        (event as any)[key] = (changes as any)[key];
      }
    });

    return event.save();
  },

  async deleteEvent(id: string, userId: string) {
    const activeReservations = await Reservation.countDocuments({
      event: id,
      status: { $ne: 'cancelled' }
    });
  
    if (activeReservations > 0) {
      // No borramos, pero tampoco lanzamos error
      return null;
    }
  
    const event = await Event.findOneAndDelete({ _id: id, creator: userId });
    return event;
  },
  
  async listEventsByUser(userId: string) {
    return Event.find({ creator: userId }).populate('creator', 'name email').exec();
  }
};
