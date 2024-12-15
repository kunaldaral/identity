import { Pool, PoolConfig } from "pg";
import { ActorManager } from "./actorManager";
import { UserAuth } from "./auth/userAuth";
import { SystemAuth } from "./auth/systemAuth";
import { ThirdPartyAuth } from "./auth/thirdPartyAuth";
import { TokenStore } from "./auth/tokenStore";
import {
  IActorModule,
  IUserAuth,
  ISystemAuth,
  IThirdPartyAuth,
  IActorManager,
  TokenResponse,
  TokenPayload,
} from "./types";
import {
  validateAccessToken as validateToken,
  refreshAccessToken as refreshToken,
  revokeRefreshToken as revokeToken,
} from "./auth/tokenService";
import { jwtDecode } from "jwt-decode";

export class ActorModule implements IActorModule {
  private static instance: ActorModule;
  public userAuth: IUserAuth;
  public systemAuth: ISystemAuth;
  public thirdPartyAuth: IThirdPartyAuth;
  private actorManager: IActorManager;
  private pool: Pool;

  constructor(poolConfig: PoolConfig) {
    this.pool = new Pool({
      ...poolConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    this.actorManager = new ActorManager(this.pool);
    this.userAuth = new UserAuth(this.actorManager);
    this.systemAuth = new SystemAuth(this.actorManager);
    this.thirdPartyAuth = new ThirdPartyAuth(this.actorManager);
  }

  /**
   * Initializes the actor module.
   */
  public async initialize(): Promise<void> {
    await this.actorManager.initialize();
    TokenStore.initialize(this.pool);
    await TokenStore.instance.initialize();
    ActorModule.instance = this;
  }

  /**
   * Gets the ActorManager instance.
   */
  public getActorManager(): IActorManager {
    return this.actorManager;
  }

  /**
   * Gets the singleton instance of the ActorModule.
   * @param pool - The PostgreSQL connection pool.
   * @returns The ActorModule instance.
   */
  public static async getInstance(
    pool?: PoolConfig
  ): Promise<ActorModule | undefined> {
    if (this.instance) {
      return this.instance;
    }
    if (pool) {
      this.instance = new ActorModule(pool);
      await this.instance.initialize();
      return this.instance;
    }
    return undefined;
  }

  /**
   * Validate access token and if valid and unexpeired, return the token payload. Else throw error.
   * @param accessToken
   * @returns
   */
  public static validateAccessToken(accessToken: string): TokenPayload {
    try {
      return validateToken(accessToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Extracts the payload from a token response.
   * @param tokenResponse - The token response.
   * @returns The token payload.
   */
  public getTokenPayloadFromTokenResponse(
    tokenResponse: TokenResponse
  ): TokenPayload {
    const { accessToken } = tokenResponse;
    const decoded = jwtDecode<TokenPayload>(accessToken);
    return decoded;
  }

  /**
   * Refreshes an access token using a refresh token.
   * @param accessTokenStr - The current access token we are looking to refresh.
   * @returns A new access token and refresh token.
   */
  public static async refreshAccessToken(
    accessTokenStr: string
  ): Promise<TokenResponse> {
    return await refreshToken(accessTokenStr);
  }

  /**
   * Revokes a refresh token.
   * @param actorID - The actor's ID.
   * @param refreshTokenStr - The refresh token to revoke.
   */
  public static async revokeRefreshToken(
    actorID: string
  ): Promise<void> {
    await revokeToken(actorID);
  }
}
