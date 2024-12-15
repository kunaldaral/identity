// src/auth/tokenService.ts

import jwt from "jsonwebtoken";
import { ActorType, TokenPayload, TokenResponse } from "../types";
import { TokenStore } from "./tokenStore";
import { errors } from "../utils/errors";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = "150m"; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRATION = "7d"; // Refresh token expires in 7 days

/**
 * Generates an access token and a refresh token.
 * @param payload - The token payload.
 * @returns An object containing the access token and refresh token.
 */
export async function generateTokens(
  payload: TokenPayload
): Promise<TokenResponse> {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign({ actorID: payload.actorId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  // Store the refresh token
  await TokenStore.instance.storeRefreshToken(payload.actorId, refreshToken);

  return { accessToken, refreshToken };
}

/**
 * Validates an access token.
 * @param token - The JWT token.
 * @returns The decoded token payload.
 */
export function validateAccessToken(token: string): TokenPayload {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set.");
    }
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.log("Error validating access token:", error);
    throw errors.INVALID_TOKEN(error);
  }
}

/**
 * Refreshes the access token using a refresh token.
 * @param refreshTokenStr - The refresh token.
 * @returns A new access token and refresh token.
 */
export async function refreshAccessToken(
  accessTokenStr: string
): Promise<TokenResponse> {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set.");
    }

    let decoded;
    try {
      decoded = jwt.verify(accessTokenStr, JWT_SECRET, {
        ignoreExpiration: true,
      }) as { actorId: string, actorType: ActorType };
    } catch (error) {
      // Token is invalid or has been tampered with
      console.log("Error verifying access token:", error);
      throw new Error("Invalid access token.");
    }

    // Fetch the refresh token from the database
    const isValid = await TokenStore.instance.verifyRefreshTokenForActor(
      decoded.actorId
    );
    if (!isValid) {
      throw new Error("Refresh token is either absent or has been revoked.");
    }

    // Generate new tokens
    const tokens = await generateTokens({
      actorId: decoded.actorId,
      actorType: decoded.actorType,
    });

    return tokens;
  } catch (error) {
    console.log("Error refreshing access token:", error);
    throw new Error("Invalid or expired access token.");
  }
}

/**
 * Revokes a refresh token.
 * @param actorID - The actor's ID.
 * @param refreshTokenStr - The refresh token to revoke.
 */
export async function revokeRefreshToken(
  actorID: string
): Promise<void> {
  await TokenStore.instance.revokeRefreshToken(actorID);
}
