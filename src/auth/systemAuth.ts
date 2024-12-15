// src/auth/systemAuth.ts

import { IActorManager, ISystemAuth, SYSTEM_ACTOR, TokenResponse } from '../types';
import { generateTokens } from './tokenService';

/**
 * SystemAuth handles authentication for system actors.
 */
export class SystemAuth implements ISystemAuth {
    private actorManager: IActorManager;

    constructor(actorManager: IActorManager) {
        this.actorManager = actorManager;
    }

    /**
     * Registers a new system actor.
     * @param name - System actor's name.
     * @param phone - System actor's phone number.
     * @param email - System actor's email.
     * @param dob - System actor's date of birth.
     * @param systemToken - Pre-shared system token.
     * @returns Access token and refresh token.
     */
    public async registerSystemActor(
        name: string,
        phone: string,
        email: string,
        dob: Date,
        systemToken: string
    ): Promise<TokenResponse> {
        const actor = await this.actorManager.addActor(
            name,
            phone,
            email,
            systemToken,
            dob,
            SYSTEM_ACTOR
        );

        // Generate JWT tokens
        const tokens = await generateTokens({
            actorId: actor.actorId,
            actorType: SYSTEM_ACTOR,
        });

        return tokens;
    }

    /**
     * Authenticates a system actor.
     * @param actorID - System actor's ID.
     * @param systemToken - Pre-shared system token.
     * @returns Access token and refresh token.
     */
    public async authenticateSystemActor(
        actorID: string,
        systemToken: string
    ): Promise<TokenResponse> {
        const systemTokenMatch = await this.actorManager.validateSystemActor(actorID, systemToken);
        if (!systemTokenMatch) {
            throw new Error('Invalid actorID or system token.');
        }

        const actor = await this.actorManager.getActor(actorID);
        if (!actor || actor.actorType !== SYSTEM_ACTOR) {
            throw new Error('System actor not found.');
        }

        // Generate JWT tokens
        const tokens = await generateTokens({
            actorId: actor.actorId,
            actorType: SYSTEM_ACTOR,
        });

        return tokens;
    }
}