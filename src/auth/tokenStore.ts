// src/auth/tokenStore.ts

import type { Pool } from 'pg';
import { ActorManager } from '../actorManager';

/**
 * TokenStore manages storage and verification of refresh tokens.
 */
export class TokenStore {
    private static _instance: TokenStore;
    private pool: Pool;
    public actorManager: ActorManager;

    private constructor(pool: Pool) {
        this.pool = pool;
        this.actorManager = new ActorManager(pool);
    }

    /**
     * Initializes the singleton instance of TokenStore.
     * @param pool - The PostgreSQL connection pool.
     */
    public static initialize(pool: Pool): void {
        if (!TokenStore._instance) {
            TokenStore._instance = new TokenStore(pool);
        }
    }

    /**
     * Gets the singleton instance of TokenStore.
     */
    public static get instance(): TokenStore {
        if (!TokenStore._instance) {
            throw new Error('TokenStore not initialized.');
        }
        return TokenStore._instance;
    }

    /**
     * Initializes the refresh tokens table.
     */
    public async initialize(): Promise<void> {
        const refreshTokenTableSchema = `
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            actorID VARCHAR(64),
            refreshToken TEXT,
            revoked BOOLEAN DEFAULT FALSE,
            issuedAt TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (actorID, refreshToken)
        );
        `;
        const client = await this.pool.connect();
        try {
            await client.query(refreshTokenTableSchema);
        } finally {
            client.release();
        }
    }

    /**
     * Stores a refresh token.
     * @param actorID - The actor's ID.
     * @param refreshToken - The refresh token.
     */
    public async storeRefreshToken(actorID: string, refreshToken: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                `INSERT INTO refresh_tokens (actorID, refreshToken) VALUES ($1, $2)`,
                [actorID, refreshToken]
            );
        } finally {
            client.release();
        }
    }

    /**
     * Gets a refresh token for an actor.
     * @param actorID - The actor's ID.
     * @returns The refresh token.
     */
    public async verifyRefreshTokenForActor(actorID: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            const res = await client.query(
                `SELECT refreshToken FROM refresh_tokens WHERE actorID = $1 AND revoked = FALSE`,
                [actorID]
            );
            if (res.rows.length > 0) {
                return true;
            } else {
                return false;
            }
        } finally {
            client.release();
        }
    }

    /**
     * Verifies a refresh token.
     * @param actorID - The actor's ID.
     * @param refreshToken - The refresh token.
     * @returns True if valid and not revoked, false otherwise.
     */
    public async verifyRefreshToken(actorID: string, refreshToken: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            const res = await client.query(
                `SELECT revoked FROM refresh_tokens WHERE actorID = $1 AND refreshToken = $2`,
                [actorID, refreshToken]
            );
            console.log(res.rows);
            if (res.rows.length > 0) {
                return !res.rows[0].revoked;
            } else {
                return false;
            }
        } finally {
            client.release();
        }
    }

    /**
     * Revokes a refresh token.
     * @param actorID - The actor's ID.
     * @param refreshToken - The refresh token to revoke.
     */
    public async revokeRefreshToken(actorID: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                `UPDATE refresh_tokens SET revoked = TRUE WHERE actorID = $1`,
                [actorID]
            );
        } finally {
            client.release();
        }
    }
}