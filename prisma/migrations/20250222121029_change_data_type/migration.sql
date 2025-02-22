-- AlterTable
ALTER TABLE `PromptHistory` MODIFY `healthPrompt` TEXT NOT NULL,
    MODIFY `foodPrompt` TEXT NOT NULL,
    MODIFY `toxicPrompt` TEXT NOT NULL;
