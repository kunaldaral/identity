// src/actorManager.ts

import type { Pool } from "pg";
import { Actor, ActorRegistration } from "./models/actor";
import { ActorStore } from "./actorStore";
import { generateActorID } from "./utils/idGenerator";
import { ActorType, IActorManager } from "./types";

/**
 * ActorManager handles business logic related to actors.
 */
export class ActorManager implements IActorManager {
  private actorStore: ActorStore;

  constructor(pool: Pool) {
    this.actorStore = new ActorStore(pool);
  }

  /**
   * Initializes the actor manager.
   */
  public async initialize(): Promise<void> {
    await this.actorStore.initialize();
  }

  /**
   * Adds a new actor.
   * @param name - Actor's name.
   * @param phone - Actor's phone number.
   * @param email - Actor's email.
   * @param dob - Actor's date of birth.
   * @param actorType - 'user' or 'system'.
   * @returns The created actor object.
   */
  public async addActor(
    name: string,
    phone: string,
    email: string,
    password: string,
    dob: Date,
    actorType: ActorType
  ): Promise<Actor> {
    const actorId = generateActorID(email + Date.now().toString());
    const actor: ActorRegistration = {
      actorId,
      name,
      phone,
      email,
      password,
      dob,
      actorType,
    };
    await this.actorStore.addActor(actor);
    return actor;
  }

  /**
   * Retrieves an actor by actorID.
   * @param actorID - The actor's unique ID.
   * @returns The actor object or undefined.
   */
  public async getActor(actorId: string): Promise<Actor | undefined> {
    return await this.actorStore.getActor(actorId);
  }

  /**
   * Retrieves an actor by email.
   * @param email - The actor's email.
   * @returns The actor object or undefined.
   */
  public async getActorByEmail(email: string): Promise<Actor | undefined> {
    return await this.actorStore.getActorByEmail(email);
  }

  /**
   * Validates an actor's password.
   * @param email - Actor's email.
   * @param password - Actor's password.
   * @returns True if the password matches, false otherwise.
   */
  public async validatePassword(
    email: string,
    password: string
  ): Promise<boolean> {
    return await this.actorStore.validatePassword(email, password);
  }


  /**
   * Validates an system actor's token.
   * @param actorId - Actor's ID.
   * @param systemToken - Actor's system token.
   * @returns True if the password matches, false otherwise.
   */
  public async validateSystemActor(
    actorId: string,
    systemToken: string
  ): Promise<boolean> {
    return await this.actorStore.validateSystemActor(actorId, systemToken);
  }

}
