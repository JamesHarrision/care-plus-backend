import { Response } from 'express';
import { AuthRequest } from '../interfaces/interfaces';
import { healthRecordService } from '../services/health-record.service';

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  RECORD_NOT_FOUND: { status: 404, message: 'Không tìm thấy bản ghi' },
  CANNOT_EDIT_PAST_RECORD: { status: 403, message: 'Thành viên chỉ được sửa chỉ số trong ngày' },
  INSUFFICIENT_PERMISSION: { status: 403, message: 'Chỉ chủ nhà mới có quyền xóa chỉ số' },
};

function handleError(res: Response, error: any) {
  const mapped = ERROR_MAP[error.message];
  if (mapped) return res.status(mapped.status).json({ status: 'error', message: mapped.message });
  console.error('[HealthRecord Error]:', error);
  return res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
}

export const healthRecordController = {
  getHealthRecords: async (req: AuthRequest, res: Response) => {
    try {
      const { memberId } = req.params;
      const { date, type } = req.query;

      const records = await healthRecordService.getRecords(memberId as string, {
        date: date as string,
        type: type as string,
      });

      res.status(200).json({ status: 'success', data: { records } });
    } catch (error) {
      handleError(res, error);
    }
  },

  createHealthRecord: async (req: AuthRequest, res: Response) => {
    try {
      const { memberId } = req.params;
      const { type, value, unit, note, recorded_at } = req.body;

      if (!type || !value || !unit) {
        return res.status(400).json({ status: 'error', message: 'Thiếu thông tin bắt buộc: type, value, unit' });
      }

      const record = await healthRecordService.createRecord({
        family_member_id: memberId as string,
        // family_id: familyId as string,
        updated_by_user_id: req.user!.id,
        type,
        value,
        unit,
        note,
        recorded_at: recorded_at ? new Date(recorded_at) : undefined,
      });

      res.status(201).json({ status: 'success', data: { record } });
    } catch (error) {
      handleError(res, error);
    }
  },

  updateHealthRecord: async (req: AuthRequest, res: Response) => {
    try {
      const { recordId } = req.params;
      const familyRole = req.familyRole as 'OWNER' | 'MEMBER';
      const { value, unit, note } = req.body;

      const record = await healthRecordService.updateRecord(recordId as string, familyRole, { value, unit, note });

      res.status(200).json({ status: 'success', data: { record } });
    } catch (error) {
      handleError(res, error);
    }
  },

  deleteHealthRecord: async (req: AuthRequest, res: Response) => {
    try {
      const { recordId } = req.params;
      const familyRole = req.familyRole as 'OWNER' | 'MEMBER';

      await healthRecordService.deleteRecord(recordId as string, familyRole);

      res.status(200).json({ status: 'success', data: { message: 'Xóa chỉ số thành công' } });
    } catch (error) {
      handleError(res, error);
    }
  },
};
