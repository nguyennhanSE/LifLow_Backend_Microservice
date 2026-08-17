-- Enable trigram operator class used by users_name_idx and users_email_idx.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "ERoleName" AS ENUM ('ADMIN', 'GENERAL_MANAGER', 'MANAGER', 'MD', 'CS_MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "membership_level" TEXT,
    "age" INTEGER,
    "email" TEXT,
    "phone_number" TEXT,
    "total_used_points" INTEGER DEFAULT 0,
    "available_points" INTEGER DEFAULT 0,
    "registration_date" TEXT,
    "dormancy_date" TEXT,
    "withdrawal_date" TEXT,
    "withdrawal_type" TEXT,
    "reason_for_withdrawal" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "total_purchase_amount" INTEGER DEFAULT 0,
    "dashboard_access" BOOLEAN DEFAULT false,
    "member_access" BOOLEAN DEFAULT false,
    "product_access" BOOLEAN DEFAULT false,
    "order_access" BOOLEAN DEFAULT false,
    "recipe_access" BOOLEAN DEFAULT false,
    "banner_access" BOOLEAN DEFAULT false,
    "mobile_phone_number" TEXT,
    "nick_name" TEXT,
    "status_message" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ip" TEXT,
    "expiredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token_used" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "refresh_token_used_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE INDEX "users_membership_level_idx" ON "users"("membership_level");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users" USING GIN ("email" gin_trgm_ops);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_expiredAt_idx" ON "sessions"("userId", "expiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_used_refreshToken_key" ON "refresh_token_used"("refreshToken");

-- CreateIndex
CREATE INDEX "refresh_token_used_sessionId_idx" ON "refresh_token_used"("sessionId");

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
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token_used" ADD CONSTRAINT "refresh_token_used_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
