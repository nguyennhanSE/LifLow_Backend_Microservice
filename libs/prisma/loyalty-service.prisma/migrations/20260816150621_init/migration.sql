-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "nick_name" TEXT,
    "base_period" INTEGER,
    "description" TEXT,
    "min_price" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "membership_name" TEXT NOT NULL,
    "membership_description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "updated_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_logs" (
    "id" TEXT NOT NULL,
    "sequence" SERIAL NOT NULL,
    "trace_id" TEXT,
    "request_id" TEXT,
    "parent_request_id" TEXT,
    "correlation_id" TEXT,
    "causation_id" TEXT,
    "request_pattern" TEXT,
    "request_status" "RequestStatus" DEFAULT 'PENDING',
    "service_name" TEXT,
    "service_ip" TEXT,
    "service_metadata" JSONB,
    "user_id" TEXT,
    "anonymous_id" TEXT,
    "session_id" TEXT,
    "actor_type" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loki_pushed_at" TIMESTAMP(3),
    "loki_push_error" TEXT,
    "loki_retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memberships_name_key" ON "memberships"("name");

-- CreateIndex
CREATE INDEX "memberships_name_idx" ON "memberships"("name");

-- CreateIndex
CREATE INDEX "memberships_min_price_idx" ON "memberships"("min_price");

-- CreateIndex
CREATE UNIQUE INDEX "user_memberships_user_id_key" ON "user_memberships"("user_id");

-- CreateIndex
CREATE INDEX "user_memberships_membership_id_idx" ON "user_memberships"("membership_id");

-- CreateIndex
CREATE INDEX "user_memberships_user_id_idx" ON "user_memberships"("user_id");

-- CreateIndex
CREATE INDEX "user_memberships_user_id_membership_id_idx" ON "user_memberships"("user_id", "membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "request_logs_sequence_key" ON "request_logs"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "request_logs_request_id_key" ON "request_logs"("request_id");

-- CreateIndex
CREATE INDEX "request_logs_user_id_occurred_at_idx" ON "request_logs"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_entity_type_entity_id_occurred_at_idx" ON "request_logs"("entity_type", "entity_id", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_trace_id_occurred_at_idx" ON "request_logs"("trace_id", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_request_id_idx" ON "request_logs"("request_id");

-- CreateIndex
CREATE INDEX "request_logs_parent_request_id_idx" ON "request_logs"("parent_request_id");

-- CreateIndex
CREATE INDEX "request_logs_correlation_id_occurred_at_idx" ON "request_logs"("correlation_id", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_request_pattern_occurred_at_idx" ON "request_logs"("request_pattern", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_request_status_occurred_at_idx" ON "request_logs"("request_status", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_loki_pushed_at_idx" ON "request_logs"("loki_pushed_at");

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
