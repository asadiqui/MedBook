-- CreateTable
CREATE TABLE "user_ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_ai_usage_userId_date_key" ON "user_ai_usage"("userId", "date");

-- AddForeignKey
ALTER TABLE "user_ai_usage" ADD CONSTRAINT "user_ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
