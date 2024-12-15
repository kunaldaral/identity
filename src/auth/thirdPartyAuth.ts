// src/auth/thirdPartyAuth.ts

import { OAuth2Client } from 'google-auth-library';
import { IActorManager, IThirdPartyAuth, TokenResponse } from '../types';
import { generateTokens } from './tokenService';

/**
 * ThirdPartyAuth handles authentication via Google OAuth2.
 */
export class ThirdPartyAuth implements IThirdPartyAuth{
    private googleClient: OAuth2Client;
    private actorManager: IActorManager;

    constructor(actorManager: IActorManager) {
        // Initialize Google OAuth2 Client
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        this.actorManager = actorManager;
    }

    /**
     * Authenticates a user with Google OAuth2.
     * @param idToken - The ID token from the client.
     * @returns Access token and refresh token.
     */
    public async authenticateWithGoogle(idToken: string): Promise<TokenResponse> {
        try {
            // Verify the ID token with Google OAuth2
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                throw new Error('Email not available in token.');
            }

            const email = payload.email;

            // Check if user exists
            let actor = await this.actorManager.getActorByEmail(email);
            if (!actor) {
                // Register new user
                actor = await this.actorManager.addActor(
                    payload.name || 'Google User',
                    '', // Phone number not available
                    email,
                    "", // Password not available
                    new Date(), // DOB not available
                    'user'
                );
            }

            // Generate tokens
            const tokens = await generateTokens({
                actorId: actor.actorId,
                actorType: 'user',
            });

            return tokens;
        } catch (error) {
            console.error('Error authenticating with Google:', error);
            throw new Error('Authentication failed.');
        }
    }
}