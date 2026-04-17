import { Request, Response } from "express";
import { familyService } from "../services/family.service";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../interfaces/interfaces";

export class FamilyController {
  public createFamily = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { name, address } = req.body;
      const family = await familyService.createFamily(userId as string, name, address);

      res.status(201).json({ status: "success", data: { family } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }

  public generateInvite = async (req: AuthRequest, res: Response) => {
    try {
      const { familyId } = req.params;
      const inviteCode = await familyService.generateInviteCode(familyId as string);

      res.status(200).json({
        status: 'success',
        data: { inviteCode, expiresIn: 300 }
      })
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }


  public joinFamily = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { inviteCode } = req.body;

      await familyService.joinFamily(userId as string, inviteCode);
      res.status(200).json({
        status: 'success',
        data: { message: 'Yêu cầu tham gia đã được gửi, chờ chủ nhà duyệt.' }
      });
    } catch (error: any) {
      if (error.message === 'INVITE_INVALID_OR_EXPIRED') return res.status(400).json({ status: 'error', message: 'Mã không hợp lệ hoặc đã hết hạn' });
      if (error.message === 'ALREADY_MEMBER_OR_PENDING') return res.status(409).json({ status: 'error', message: 'Người dùng đã là thành viên hoặc đang chờ duyệt' });
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }

  public getPendingMember = async (req: AuthRequest, res: Response) => {
    try {
      const { familyId } = req.params;
      const members = await familyService.getPendingMembers(familyId as string);

      res.status(200).json({ status: 'success', data: { members } });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }

  public reviewJoinRequest = async (req: AuthRequest, res: Response) => {
    try {
      const { familyId, memberId } = req.params;
      const { status } = req.body; // 'APPROVED' hoặc 'REJECTED'

      await familyService.reviewJoinRequest(
        familyId as string,
        memberId as string,
        status);

      res.status(200).json({
        status: 'success',
        data: { message: 'Cập nhật trạng thái thành công' }
      });
    } catch (error) {
      res.status(400).json({ status: 'error', message: 'Không tìm thấy yêu cầu' });
    }
  }

  public getUserFamilies = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const families = await familyService.getUserFamilies(userId);
      res.status(200).json({ status: 'success', data: { families } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }

  public getFamilyMembers = async (req: AuthRequest, res: Response) => {
    try {
      const { familyId } = req.params;
      const members = await familyService.getFamilyMembers(familyId as string);

      res.status(200).json({ status: 'success', data: { members } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }

  // =============== Quick Login (Device-Bound) ===============

  public setupDeviceLogin = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const { memberId } = req.params;
      const { device_fingerprint, device_name } = req.body;

      if (!device_fingerprint) {
        return res.status(400).json({ status: 'error', message: 'Thiếu device_fingerprint' });
      }

      const result = await authService.setupDeviceLogin(userId, memberId as string, {
        device_fingerprint,
        device_name,
      });

      res.status(201).json({
        status: 'success',
        data: {
          ...result,
          message: 'Thiết lập đăng nhập nhanh thành công',
        },
      });
    } catch (error: any) {
      if (error.message === 'MEMBER_NOT_FOUND') return res.status(404).json({ status: 'error', message: 'Không tìm thấy thành viên' });
      if (error.message === 'INSUFFICIENT_FAMILY_ROLE') return res.status(403).json({ status: 'error', message: 'Quyền hạn trong gia đình không đủ' });
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }

  public revokeDeviceLogin = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const { memberId } = req.params;
      await familyService.revokeDeviceLogin(userId, memberId as string);

      res.status(200).json({
        status: 'success',
        data: { message: 'Đã thu hồi quyền đăng nhập trên thiết bị' },
      });
    } catch (error: any) {
      if (error.message === 'MEMBER_NOT_FOUND') return res.status(404).json({ status: 'error', message: 'Không tìm thấy thành viên' });
      if (error.message === 'INSUFFICIENT_FAMILY_ROLE') return res.status(403).json({ status: 'error', message: 'Quyền hạn trong gia đình không đủ' });
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }

  public getFamilyDevices = async (req: AuthRequest, res: Response) => {
    try {
      const { familyId } = req.params;
      const devices = await familyService.getFamilyDevices(familyId as string);

      res.status(200).json({ status: 'success', data: { devices } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
  }
}