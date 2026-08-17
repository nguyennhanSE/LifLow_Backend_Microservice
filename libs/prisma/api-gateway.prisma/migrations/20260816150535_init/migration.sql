-- CreateEnum
CREATE TYPE "TraceStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL,
    "sequence" SERIAL NOT NULL,
    "trace_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "status" "TraceStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trace_id_key" ON "Trace"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Trace_sequence_key" ON "Trace"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "Trace_trace_id_key" ON "Trace"("trace_id");

-- CreateIndex
CREATE INDEX "Trace_trace_id_idx" ON "Trace"("trace_id");
