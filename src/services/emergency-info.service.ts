import { IEmergencyContact, IEmergencyInfo } from "../models/emergency-info.model";
import { emergencyInfoRepository } from "../repositories/emergency-info.repository";
import { userRepository } from "../repositories/user.repository";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

type UpsertEmergencyInfoInput = {
  blood_type?: IEmergencyInfo["blood_type"];
  allergies?: string[];
  chronic_diseases?: string[];
  emergency_contacts?: IEmergencyContact[];
  current_medications?: string[];
  notes?: string;
};

const QUICK_ACCESS_TTL_SECONDS = 86400;
const QUICK_ACCESS_BASE_URL = process.env.FE_URL ?? "http://localhost:8081";

export const emergencyInfoService = {
  async upsertEmergencyInfo(
    userId: string,
    data: UpsertEmergencyInfoInput,
  ) {
    return await emergencyInfoRepository.upsertByUserId(userId, data);
  },

  async generateQrForCurrentUser(userId: string) {
    const emergencyInfo = await emergencyInfoRepository.findByUserId(userId);
    if (!emergencyInfo) {
      throw new Error("EMERGENCY_INFO_NOT_FOUND");
    }

    const publicId = uuidv4();
    const quickAccessUrl = `${QUICK_ACCESS_BASE_URL}/emergency/?id=${publicId}`;

    await emergencyInfoRepository.saveQuickAccessPublicId(
      publicId,
      userId,
      QUICK_ACCESS_TTL_SECONDS,
    );

    const qrCodeUrl = await QRCode.toDataURL(quickAccessUrl);

    return {
      qrCodeUrl,
      quickAccessUrl,
    };
  },

  async getPublicEmergencyInfoByPublicId(publicId: string) {
    const userId = await emergencyInfoRepository.getUserIdByQuickAccessPublicId(publicId);
    if (!userId) {
      throw new Error("PUBLIC_EMERGENCY_INFO_NOT_FOUND");
    }

    const [user, emergencyInfo] = await Promise.all([
      userRepository.findById(userId),
      emergencyInfoRepository.findByUserId(userId),
    ]);

    if (!user || !emergencyInfo) {
      throw new Error("PUBLIC_EMERGENCY_INFO_NOT_FOUND");
    }

    return {
      full_name: user.full_name,
      blood_type: emergencyInfo.blood_type ?? null,
      allergies: emergencyInfo.allergies,
      chronic_diseases: emergencyInfo.chronic_diseases,
      emergency_contacts: emergencyInfo.emergency_contacts,
      current_medications: emergencyInfo.current_medications,
    };
  },
};
