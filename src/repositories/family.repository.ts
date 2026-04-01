import { prisma } from "../config/prisma.config";

export const familyRepository = {
  async findFamilyMember(familyId: string, userId: string) {
    return await prisma.familyMember.findUnique({
      where: {
        family_id_user_id: {
          family_id: familyId,
          user_id: userId
        }
      }
    })
  },

  
}