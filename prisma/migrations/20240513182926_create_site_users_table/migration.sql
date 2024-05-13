-- CreateTable
CREATE TABLE "site_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "site_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_users_email_key" ON "site_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "site_users_username_key" ON "site_users"("username");
