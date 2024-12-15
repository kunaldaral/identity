// src/auth/userAuth.ts

import bcrypt from 'bcrypt';
import { IActorManager, IUserAuth, TokenResponse, USER } from '../types';
import { generateTokens } from './tokenService';

const SALT_ROUNDS = 10;

/**
 * UserAuth handles authentication for end users.
 */
export class UserAuth implements IUserAuth {
    private actorManager: IActorManager;

    constructor(actorManager: IActorManager) {
        this.actorManager = actorManager;
    }

    /**
     * Registers a new user.
     * @param name - User's name.
     * @param phone - User's phone number.
     * @param email - User's email.
     * @param dob - User's date of birth.
     * @param password - User's password.
     * @returns Access token and refresh token.
     */
    public async registerUser(
        name: string,
        phone: string,
        email: string,
        dob: Date,
        password: string
    ): Promise<TokenResponse> {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const actor = await this.actorManager.addActor(
            name,
            phone,
            email,
            hashedPassword,
            dob,
            USER
        );

        // Generate JWT tokens
        const tokens = await generateTokens({
            actorId: actor.actorId,
            actorType: actor.actorType,
        });

        return tokens;
    }

    /**
     * Logs in a user.
     * @param email - User's email.
     * @param password - User's password.
     * @returns Access token and refresh token.
     */
    public async loginUser(email: string, password: string): Promise<TokenResponse> {
        
        const passwordMatch = await this.actorManager.validatePassword(email, password);
        if (!passwordMatch) {
            throw new Error('Invalid email or password.');
        }

        const actor = await this.actorManager.getActorByEmail(email);
        if (!actor) {
            throw new Error('User not found.');
        }

        // Generate JWT tokens
        const tokens = await generateTokens({
            actorId: actor.actorId,
            actorType: actor.actorType,
        });

        return tokens;
    }
}