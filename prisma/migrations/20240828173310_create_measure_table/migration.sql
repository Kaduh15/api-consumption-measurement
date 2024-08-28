-- CreateEnum
CREATE TYPE "MeasureType" AS ENUM ('WATER', 'GAS');

-- CreateTable
CREATE TABLE "Measure" (
    "id" TEXT NOT NULL,
    "measure_value" INTEGER NOT NULL,
    "measure_datetime" TEXT NOT NULL,
    "measure_type" "MeasureType" NOT NULL,
    "customer_code" TEXT NOT NULL,
    "image_base64" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Measure_pkey" PRIMARY KEY ("id")
);
