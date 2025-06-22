-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('message', 'image');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('simple', 'invoice');

-- CreateTable
CREATE TABLE "Source" (
    "id" SERIAL NOT NULL,
    "type" "SourceType" NOT NULL,
    "description" VARCHAR(255),
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "fileUrl" VARCHAR(512),

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "vendor" VARCHAR(100),
    "description" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(5) NOT NULL,
    "expenseType" "ExpenseType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceDetail" (
    "id" SERIAL NOT NULL,
    "expenseId" INTEGER NOT NULL,
    "product" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InvoiceDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
