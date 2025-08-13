import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReservation extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  reservationDate: Date;
  status: 'active' | 'cancelled';
}

const ReservationSchema: Schema<IReservation> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  reservationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' }
});

export const Reservation: Model<IReservation> = mongoose.model<IReservation>('Reservation', ReservationSchema);
