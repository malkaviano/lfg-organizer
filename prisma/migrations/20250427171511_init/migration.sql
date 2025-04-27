-- CreateTable
CREATE TABLE "QueuedPlayer" (
    "id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "roles" VARCHAR(20)[],
    "dungeons" VARCHAR(20)[],
    "queuedAt" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "playingWith" UUID[],
    "groupId" VARCHAR(20),
    "groupedAt" VARCHAR(20),
    "groupRole" VARCHAR(20),

    CONSTRAINT "QueuedPlayer_pkey" PRIMARY KEY ("id")
);
