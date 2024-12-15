export type Error = {
  status: number;
  code: string;
  message: string;
};

export const USER = "user";
export const SYSTEM_ACTOR = "systemActor";
export type ActorType = "user" | "systemActor";

/**
 * Represents an actor in the system.
 */
export interface Actor {
  actorId: string;
  name: string;
  phone: string;
  email: string;
  dob: Date;
  actorType: ActorType;
}

/**
 * Response object containing access and refresh tokens.
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Payload for JWT tokens.
 */
export interface TokenPayload {
  actorId: string;
  actorType: ActorType;
}

/**
 * Interface for the ActorModule class.
 */
export interface IActorModule {
  userAuth: IUserAuth;
  systemAuth: ISystemAuth;
  thirdPartyAuth: IThirdPartyAuth;
  initialize(): Promise<void>;
  getActorManager(): IActorManager;
}

/**
 * Interface for user authentication.
 */
export interface IUserAuth {
  registerUser(
    name: string,
    phone: string,
    email: string,
    dob: Date,
    password: string
  ): Promise<TokenResponse>;

  loginUser(email: string, password: string): Promise<TokenResponse>;
}

/**
 * Interface for system actor authentication.
 */
export interface ISystemAuth {
  registerSystemActor(
    name: string,
    phone: string,
    email: string,
    dob: Date,
    systemToken: string
  ): Promise<TokenResponse>;

  authenticateSystemActor(
    actorId: string,
    systemToken: string
  ): Promise<TokenResponse>;
}

/**
 * Interface for third-party authentication.
 */
export interface IThirdPartyAuth {
  authenticateWithGoogle(idToken: string): Promise<TokenResponse>;
}

/**
 * Interface for managing actors.
 */
export interface IActorManager {
  initialize(): Promise<void>;
  addActor(
    name: string,
    phone: string,
    email: string,
    password: string,
    dob: Date,
    actorType: ActorType
  ): Promise<Actor>;
  getActor(actorId: string): Promise<Actor | undefined>;
  getActorByEmail(email: string): Promise<Actor | undefined>;
  validatePassword(email: string, password: string): Promise<boolean>;
  validateSystemActor(actorId: string, systemToken: string): Promise<boolean>;
}
