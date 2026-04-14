import mongoose, { Document, Schema } from "mongoose";

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IEmergencyInfo extends Document {
  user_id: string;
  blood_type?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  allergies: string[];
  chronic_diseases: string[];
  emergency_contacts: IEmergencyContact[];
  current_medications: string[];
  notes?: string;
  updated_at: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
  },
  {
    _id: false,
  },
);

const EmergencyInfoSchema: Schema = new Schema(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    blood_type: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    allergies: { type: [String], default: [] },
    chronic_diseases: { type: [String], default: [] },
    emergency_contacts: {
      type: [EmergencyContactSchema],
      default: [],
    },
    current_medications: { type: [String], default: [] },
    notes: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updated_at" },
  },
);

export default mongoose.model<IEmergencyInfo>(
  "EmergencyInfo",
  EmergencyInfoSchema,
);
