import { redis } from "../config/redis";

const DEFAULT_TTL = 60;

export async function getCache<T>(
    key: string
): Promise<T | null> {
    if (!redis) {
        return null;
    }

    const value = await redis.get(key);

    if (!value) {
        return null;
    }

    return JSON.parse(value) as T;
}

export async function setCache(
    key: string,
    value: unknown,
    ttl = DEFAULT_TTL
) {
    if (!redis) {
        return;
    }

    await redis.set(
        key,
        JSON.stringify(value),
        "EX",
        ttl
    );
}

export async function deleteCache(
    key: string
) {
    if (!redis) {
        return;
    }

    await redis.del(key);
}