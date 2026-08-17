-- Create-Extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "RecipeCategory" AS ENUM ('RECIPE', 'REVIEWS', 'DAILY_LIFE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" "RecipeCategory" NOT NULL,
    "date_of_writing" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "thumbnail_url" TEXT[],
    "content" TEXT NOT NULL,
    "ingredients" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "likes" INTEGER DEFAULT 0,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_recipes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "product_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_comments" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_likes" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "recipe_likes_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "recipes_title_idx" ON "recipes" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "recipes_category_idx" ON "recipes"("category");

-- CreateIndex
CREATE INDEX "recipes_status_idx" ON "recipes"("status");

-- CreateIndex
CREATE INDEX "recipes_date_of_writing_idx" ON "recipes"("date_of_writing");

-- CreateIndex
CREATE UNIQUE INDEX "user_recipes_recipe_id_key" ON "user_recipes"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_comments_author_id_recipe_id_idx" ON "recipe_comments"("author_id", "recipe_id");

-- CreateIndex
CREATE INDEX "recipe_comments_recipe_id_idx" ON "recipe_comments"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_comments_author_id_idx" ON "recipe_comments"("author_id");

-- CreateIndex
CREATE INDEX "recipe_comments_status_idx" ON "recipe_comments"("status");

-- CreateIndex
CREATE INDEX "recipe_likes_recipe_id_idx" ON "recipe_likes"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_likes_author_id_idx" ON "recipe_likes"("author_id");

-- CreateIndex
CREATE INDEX "recipe_likes_author_id_recipe_id_status_idx" ON "recipe_likes"("author_id", "recipe_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_likes_author_id_recipe_id_key" ON "recipe_likes"("author_id", "recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "request_logs_sequence_key" ON "request_logs"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "request_logs_request_id_key" ON "request_logs"("request_id");

-- CreateIndex
CREATE INDEX "request_logs_user_id_occurred_at_idx" ON "request_logs"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_trace_id_occurred_at_idx" ON "request_logs"("trace_id", "occurred_at");

-- CreateIndex
CREATE INDEX "request_logs_correlation_id_occurred_at_idx" ON "request_logs"("correlation_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "user_recipes" ADD CONSTRAINT "user_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_likes" ADD CONSTRAINT "recipe_likes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
