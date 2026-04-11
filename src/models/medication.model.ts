import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  bin?: string;
  days?: number;
}

export interface IMedicationSchedule extends Document {
  family_id: string;
  family_member_id: string;
  medications: IMedication[];
  start_date: Date;
  end_date: Date;
  reminder_message: string;
  is_active: boolean;
  confirmed_by?: string;
  created_at: Date;
}

const MedicationSchema: Schema = new Schema({
  family_id: { type: String, required: true, index: true },
  family_member_id: { type: String, required: true, index: true },
  medications: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      bin: { type: String },
      days: { type: Number }
    }
  ],
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  reminder_message: { type: String },
  is_active: { type: Boolean, default: true },
  confirmed_by: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model<IMedicationSchedule>('MedicationSchedule', MedicationSchema);
