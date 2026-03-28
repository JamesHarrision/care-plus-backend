/*
  Warnings:

  - You are about to drop the column `role` on the `familymember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invite_code]` on the table `Family` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[family_id,user_id]` on the table `FamilyMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Family` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `family` ADD COLUMN `invite_code` VARCHAR(6) NULL,
    ADD COLUMN `invite_code_exp` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `familymember` DROP COLUMN `role`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `family_role` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    ADD COLUMN `join_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `system_role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Family_invite_code_key` ON `Family`(`invite_code`);

-- CreateIndex
CREATE UNIQUE INDEX `FamilyMember_family_id_user_id_key` ON `FamilyMember`(`family_id`, `user_id`);
