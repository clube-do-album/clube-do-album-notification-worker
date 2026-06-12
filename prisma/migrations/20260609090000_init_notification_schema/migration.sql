CREATE TYPE "notification_type" AS ENUM (
  'ALBUM_RATED',
  'USER_FOLLOWED',
  'RANKING_UPDATED'
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "type" "notification_type" NOT NULL,
  "recipient_user_id" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "album_id" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "occurred_at" TIMESTAMP(3) NOT NULL,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notifications_type_recipient_user_id_actor_user_id_album_id_occurred_at_key"
  ON "notifications"("type", "recipient_user_id", "actor_user_id", "album_id", "occurred_at");

CREATE INDEX "notifications_recipient_user_id_read_at_created_at_idx"
  ON "notifications"("recipient_user_id", "read_at", "created_at");

CREATE INDEX "notifications_actor_user_id_created_at_idx"
  ON "notifications"("actor_user_id", "created_at");

CREATE INDEX "notifications_album_id_created_at_idx"
  ON "notifications"("album_id", "created_at");
