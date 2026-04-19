import { Response } from 'express';
import { AuthRequest } from '../interfaces/interfaces';
import { healthRecordService } from '../services/health-record.service';
import { familyRepository } from '../repositories/family.repository';

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

/**
 * Resolve familyRole cho request dựa trên memberId trong params.
 * - Quick-login member → luôn là MEMBER
 * - Normal user → lookup role trong family chứa target member
 */
async function resolveFamilyRole(
  req: AuthRequest,
  memberId: string,
): Promise<{ role: 'OWNER' | 'MEMBER' } | { error: { status: number; message: string } }> {
  if (req.quickLoginMember) {
    return { role: 'MEMBER' };
  }

  if (!req.user) {
    return { error: { status: 401, message: 'Không thể xác thực danh tính người dùng' } };
  }

  // Tìm family của target member
  const targetMember = await familyRepository.findMemberById(memberId);
  if (!targetMember) {
    return { error: { status: 404, message: 'Không tìm thấy thành viên' } };
  }

  // Kiểm tra requesting user có thuộc cùng family không
  const userMember = await familyRepository.findFamilyMember(targetMember.family.id, req.user.id);
  if (!userMember) {
    return { error: { status: 403, message: 'Bạn không phải là thành viên của gia đình này' } };
  }

  return { role: userMember.family_role as 'OWNER' | 'MEMBER' };
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

      // Hỗ trợ cả normal user và quick-login member
      let updatedByUserId: string;
      if (req.user) {
        updatedByUserId = req.user.id;
      } else if (req.quickLoginMember) {
        updatedByUserId = req.quickLoginMember.memberId;
      } else {
        return res.status(401).json({ status: 'error', message: 'Không thể xác thực danh tính người dùng' });
      }

      const record = await healthRecordService.createRecord({
        account_id: req.user ? req.user.id : null, // fallback khi ko dung id của quick login
        family_member_id: memberId as string,
        updated_by_user_id: updatedByUserId,
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
      const { memberId, recordId } = req.params;
      const { value, unit, note } = req.body;
      const changedByWho = req.user?.id;

      console.log('DEBUG ::: changeBy:', changedByWho, 'recordId:', recordId, 'memberId:', memberId);

      /**
       * Lưu ý:
       * - Chủ của thông tin sức khỏe: memberId trong params
       * - Người thực hiện request: req.user (normal user) hoặc req.quickLoginMember (quick-login member)
       * - Hai người này có thể trùng hoặc khác nhau tùy tình huống.
       *
       * - Ở đây kiểm tra cho phép với người thực hiện request dựa trên role của họ, không phải là memberId trong params.
       *
       */
      const result = await resolveFamilyRole(req, memberId as string);
      console.log('Resolved role:', result);
      if ('error' in result) {
        return res.status(result.error.status).json({ status: 'error', message: result.error.message });
      }
      const record = await healthRecordService.updateRecord(recordId as string, result.role, { value, unit, note });

      res.status(200).json({ status: 'success', data: { record } });
    } catch (error) {
      handleError(res, error);
    }
  },

  deleteHealthRecord: async (req: AuthRequest, res: Response) => {
    try {
      const { memberId, recordId } = req.params;

      const result = await resolveFamilyRole(req, memberId as string);
      if ('error' in result) {
        return res.status(result.error.status).json({ status: 'error', message: result.error.message });
      }

      await healthRecordService.deleteRecord(recordId as string, result.role);

      res.status(200).json({ status: 'success', data: { message: 'Xóa chỉ số thành công' } });
    } catch (error) {
      handleError(res, error);
    }
  },
};
