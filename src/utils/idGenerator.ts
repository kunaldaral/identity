// src/utils/idGenerator.ts

import crypto from 'crypto';

/**
 * Generates a unique Actor ID using SHA-256 hashing.
 * @param data - Input string to hash.
 * @returns A unique Actor ID.
 */
export function generateActorID(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}