/*
  Warnings:

  - You are about to drop the column `tokenCount` on the `user_ai_usage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_ai_usage" DROP COLUMN "tokenCount",
ADD COLUMN     "llmTokenCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ragTokenCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_specialty_idx" ON "users"("specialty");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_isVerified_idx" ON "users"("isVerified");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
