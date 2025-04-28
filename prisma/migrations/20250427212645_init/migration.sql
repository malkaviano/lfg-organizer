-- CreateTable
CREATE TABLE "QueuedPlayer" (
    "id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "roles" VARCHAR(50)[],
    "dungeons" VARCHAR(50)[],
    "queuedAt" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "playingWith" UUID[],
    "groupId" UUID,

    CONSTRAINT "QueuedPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGroup" (
    "id" UUID NOT NULL,
    "dungeon" VARCHAR(50) NOT NULL,
    "tankId" UUID NOT NULL,
    "healerId" UUID NOT NULL,
    "damage1Id" UUID NOT NULL,
    "damage2Id" UUID NOT NULL,
    "damage3Id" UUID NOT NULL,
    "sentAt" VARCHAR(50),

    CONSTRAINT "PlayerGroup_pkey" PRIMARY KEY ("id")
);
