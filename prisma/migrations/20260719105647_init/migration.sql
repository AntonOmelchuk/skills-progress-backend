-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('INTELLECTUAL', 'PHYSICAL');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('GRIND', 'MAINTAIN', 'DECAY');

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "authUid" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'V',
    "theme" TEXT NOT NULL DEFAULT 'cyberpunk-dark',
    "language" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "avatarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "lastTrainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "expChange" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_authUid_key" ON "Avatar"("authUid");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
