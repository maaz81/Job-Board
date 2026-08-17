import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

export const redis = redisUrl
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
    })
    : null;

if (redis) {
    redis.on("connect", () => {
        console.log("Redis connected");
    });

    redis.on("error", (error) => {
        console.error("Redis error:", error);
    });
}