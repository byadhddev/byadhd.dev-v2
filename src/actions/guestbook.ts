"use server";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const NOTES_KEY = "portfolio:guestbook";
const MAX_NOTES = 50;

export interface GuestbookEntry {
  name: string;
  message: string;
}

export async function getNotes(): Promise<GuestbookEntry[]> {
  try {
    const notes = await redis.lrange<GuestbookEntry>(NOTES_KEY, 0, MAX_NOTES - 1);
    if (!notes || notes.length === 0) return [];
    // Redis returns objects already parsed when stored as JSON
    return notes;
  } catch (error) {
    console.error("Failed to read guestbook from Redis:", error);
    return [];
  }
}

export async function saveNote(
  name: string,
  message: string
): Promise<{ success: boolean }> {
  try {
    const cleanMessage = message.slice(0, 80).trim();
    if (!cleanMessage) return { success: false };
    const entry: GuestbookEntry = {
      name: (name.slice(0, 20).trim() || "anon"),
      message: cleanMessage,
    };

    await redis.lpush(NOTES_KEY, JSON.stringify(entry));
    await redis.ltrim(NOTES_KEY, 0, MAX_NOTES - 1);

    return { success: true };
  } catch (error) {
    console.error("Failed to save guestbook note to Redis:", error);
    return { success: false };
  }
}
