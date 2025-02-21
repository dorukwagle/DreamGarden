/*
  Warnings:

  - You are about to drop the `Todos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Todos` DROP FOREIGN KEY `Todos_userId_fkey`;

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `profileComplete` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Todos`;

-- CreateTable
CREATE TABLE `UserPlants` (
    `plantId` VARCHAR(191) NOT NULL,
    `plant` ENUM('G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6') NOT NULL,
    `plantType` ENUM('Good', 'Bad') NOT NULL,
    `prompt` ENUM('Food', 'Health', 'Toxic') NOT NULL,
    `health` INTEGER NOT NULL,
    `age` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`plantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusTracks` (
    `statusId` VARCHAR(191) NOT NULL,
    `healthImproveCount` INTEGER NOT NULL,
    `foodImproveCount` INTEGER NOT NULL,
    `toxicImproveCount` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `StatusTracks_userId_key`(`userId`),
    PRIMARY KEY (`statusId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromptHistory` (
    `historyId` VARCHAR(191) NOT NULL,
    `healthPrompt` VARCHAR(191) NOT NULL,
    `foodPrompt` VARCHAR(191) NOT NULL,
    `toxicPrompt` VARCHAR(191) NOT NULL,
    `isInitial` BOOLEAN NOT NULL DEFAULT true,
    `lastPromptDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PromptHistory_userId_key`(`userId`),
    PRIMARY KEY (`historyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPlants` ADD CONSTRAINT `UserPlants_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusTracks` ADD CONSTRAINT `StatusTracks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptHistory` ADD CONSTRAINT `PromptHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
