import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  date: Date;
  location: string;
  capacity: number;
  creator: mongoose.Types.ObjectId;
  availableCapacity: number;
}

const EventSchema: Schema<IEvent> = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  availableCapacity: { type: Number, required: true, min: 0 },
});

EventSchema.pre<IEvent>('save', function(next) {
    if (this.isNew && (this.availableCapacity === undefined || this.availableCapacity === null)) {
      this.availableCapacity = this.capacity;
    }
    next();
});

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);
