import { Request, Response } from "express";
import { AuthRequest } from "../interfaces/interfaces";
import { emergencyInfoService } from "../services/emergency-info.service";

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  ValidationError: {
    status: 400,
    message: "Dữ liệu thông tin khẩn cấp không hợp lệ",
  },
  EMERGENCY_INFO_NOT_FOUND: {
    status: 404,
    message: "Chưa có thông tin khẩn cấp",
  },
  PUBLIC_EMERGENCY_INFO_NOT_FOUND: {
    status: 404,
    message: "Không tìm thấy thông tin",
  },
};

function handleError(res: Response, error: any) {
  const mapped = ERROR_MAP[error.message] ?? ERROR_MAP[error.name];
  if (mapped) {
    return res.status(mapped.status).json({ status: "error", message: mapped.message });
  }

  console.error("[EmergencyInfo Error]:", error);
  return res.status(500).json({ status: "error", message: "Lỗi máy chủ" });
}

export const emergencyInfoController = {
  upsertEmergencyInfo: async (req: AuthRequest, res: Response) => {
    try {
      const {
        blood_type,
        allergies,
        chronic_diseases,
        emergency_contacts,
        current_medications,
        notes,
      } = req.body;

      const emergencyInfo = await emergencyInfoService.upsertEmergencyInfo(
        req.user!.id,
        {
          blood_type,
          allergies,
          chronic_diseases,
          emergency_contacts,
          current_medications,
          notes,
        },
      );

      return res.status(200).json({
        status: "success",
        data: { emergencyInfo },
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  getEmergencyInfoQr: async (req: AuthRequest, res: Response) => {
    try {
      const data = await emergencyInfoService.generateQrForCurrentUser(req.user!.id);

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  getPublicEmergencyInfo: async (req: Request, res: Response) => {
    try {
      const { publicId } = req.params;
      const data = await emergencyInfoService.getPublicEmergencyInfoByPublicId(publicId as string);

      return res.status(200).json(data);
    } catch (error) {
      return handleError(res, error);
    }
  },
};
