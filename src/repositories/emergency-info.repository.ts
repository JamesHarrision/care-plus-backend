import EmergencyInfo, {
  IEmergencyContact,
  IEmergencyInfo,
} from "../models/emergency-info.model";
import redisClient from "../config/redis.config";

type EmergencyInfoPayload = {
  user_id: string;
  blood_type?: IEmergencyInfo["blood_type"];
  allergies?: string[];
  chronic_diseases?: string[];
  emergency_contacts?: IEmergencyContact[];
  current_medications?: string[];
  notes?: string;
};

type EmergencyInfoUpdatePayload = Omit<Partial<EmergencyInfoPayload>, "user_id">;

export const emergencyInfoRepository = {
  async findByUserId(userId: string): Promise<IEmergencyInfo | null> {
    // Mỗi user chỉ có một hồ sơ emergency info, nên truy vấn theo user_id là đủ.
    return await EmergencyInfo.findOne({ user_id: userId });
  },

  async getUserIdByQuickAccessPublicId(publicId: string): Promise<string | null> {
    return await redisClient.get(`quick:${publicId}`);
  },

  async saveQuickAccessPublicId(
    publicId: string,
    userId: string,
    ttlSeconds: number,
  ) {
    return await redisClient.set(`quick:${publicId}`, userId, { EX: ttlSeconds });
  },

  async create(data: EmergencyInfoPayload): Promise<IEmergencyInfo> {
    return await EmergencyInfo.create({
      allergies: [],
      chronic_diseases: [],
      emergency_contacts: [],
      current_medications: [],
      ...data,
    });
  },

  async upsertByUserId(
    userId: string,
    data: EmergencyInfoUpdatePayload,
  ): Promise<IEmergencyInfo | null> {
    // Dùng upsert để xử lý chung cho cả lần tạo đầu tiên và các lần cập nhật tiếp theo.
    return await EmergencyInfo.findOneAndUpdate(
      { user_id: userId },
      {
        $set: data,
        $setOnInsert: { user_id: userId },
      },
      {
        new: true,
        upsert: true,
      },
    );
  },

  async updateByUserId(
    userId: string,
    data: EmergencyInfoUpdatePayload,
  ): Promise<IEmergencyInfo | null> {
    // Không cho phép đổi user_id để tránh chuyển bản ghi sang user khác.
    return await EmergencyInfo.findOneAndUpdate(
      { user_id: userId },
      { $set: data },
      { new: true },
    );
  },

  async deleteByUserId(userId: string): Promise<IEmergencyInfo | null> {
    return await EmergencyInfo.findOneAndDelete({ user_id: userId });
  },
};
