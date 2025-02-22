-- CreateTable
CREATE TABLE `ProgressStreak` (
    `streakId` VARCHAR(191) NOT NULL,
    `healthStreak` INTEGER NOT NULL DEFAULT 0,
    `foodStreak` INTEGER NOT NULL DEFAULT 0,
    `toxicStreak` INTEGER NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ProgressStreak_userId_key`(`userId`),
    PRIMARY KEY (`streakId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProgressStreak` ADD CONSTRAINT `ProgressStreak_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
