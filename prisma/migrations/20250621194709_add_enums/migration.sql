/*
  Warnings:

  - Changed the type of `currency` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CRC', 'USD');

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL;
