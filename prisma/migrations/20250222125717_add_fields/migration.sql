/*
  Warnings:

  - Added the required column `initialFoodPrompt` to the `PromptHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialHealthPrompt` to the `PromptHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialToxicPrompt` to the `PromptHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PromptHistory` ADD COLUMN `initialFoodPrompt` TEXT NOT NULL,
    ADD COLUMN `initialHealthPrompt` TEXT NOT NULL,
    ADD COLUMN `initialToxicPrompt` TEXT NOT NULL;
