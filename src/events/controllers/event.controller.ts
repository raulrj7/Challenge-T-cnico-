import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/express';
import { eventService } from '../services/event.service';
import { Types } from 'mongoose';

const isValidObjectId = (id?: string) => id !== undefined && Types.ObjectId.isValid(id);

export const eventController = {
  async createEvent(req: AuthenticatedRequest, res: Response) {
    try {
      if (!isValidObjectId(req.user?.id)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const creatorId = new Types.ObjectId(req.user!.id);
      const { name, date, location, capacity } = req.body;

      const event = await eventService.createEvent({
        name,
        date,
        location,
        capacity,
        creator: creatorId
      });

      res.status(201).json(event);
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async listEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const events = await eventService.listEvents();
      res.json(events);
    } catch (err) {
      console.error('Error listing events:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getEventById(req: AuthenticatedRequest, res: Response) {
    try {
      const eventId = req.params.id;
      if (!isValidObjectId(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const event = await eventService.getEventById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      res.json(event);
    } catch (err) {
      console.error('Error getting event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async updateEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const eventId = req.params.id;
      const userId = req.user?.id;

      if (!isValidObjectId(userId) || !isValidObjectId(eventId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const changes = req.body;
      const updatedEvent = await eventService.updateEvent(eventId, userId!, changes);

      if (!updatedEvent) {
        return res.status(403).json({ message: 'You cannot edit this event or it does not exist' });
      }

      res.json(updatedEvent);
    } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async deleteEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const eventId = req.params.id;
      const userId = req.user?.id;
  
      if (!isValidObjectId(userId) || !isValidObjectId(eventId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
  
      const deletedEvent = await eventService.deleteEvent(eventId, userId!);
  
      if (deletedEvent === null) {
        return res.status(409).json({
          message: 'Cannot delete event because it has active reservations'
        });
      }
  
      if (!deletedEvent) {
        return res.status(403).json({
          message: 'You cannot delete this event or it does not exist'
        });
      }
  
      res.json({ message: 'Event deleted' });
    } catch (err) {
      console.error('Error deleting event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  

  async listUserEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!isValidObjectId(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const events = await eventService.listEventsByUser(userId!);
      res.json(events);
    } catch (err) {
      console.error('Error listing user events:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
