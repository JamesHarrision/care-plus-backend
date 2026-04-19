import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRecord extends Document {
  account_id?: string; // fallback khi ko dung id của quick login
  family_member_id: string;
  // family_id: string;
  updated_by_user_id: string;
  type: string; // blood_pressure | blood_sugar | weight | temperature | heart_rate
  value: Record<string, any>; // { systolic, diastolic } hoặc { value }
  unit: string;
  note?: string;
  recorded_at: Date;
  created_at: Date;
}

const HealthRecordSchema: Schema = new Schema(
  {
    account_id: { type: String, required: false, index: true }, // fallback khi ko dung id của quick login
    family_member_id: { type: String, required: true, index: true },
    // family_id: { type: String, required: true, index: true },
    updated_by_user_id: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    unit: { type: String, required: true },
    note: { type: String },
    recorded_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export default mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);
