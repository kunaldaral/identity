// src/actorStore.ts

import type { Pool } from "pg";
import { Actor, ActorRegistration, actorTableSchema } from "./models/actor";
import { SYSTEM_ACTOR, USER } from "./types";
import bcrypt from 'bcrypt';

/**
 * ActorStore handles database operations for actors.
 */
export class ActorStore {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Initializes the actors table.
   */
  public async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(actorTableSchema);
      await client.query("COMMIT");
      console.log("Actor table initialized.");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to initialize actor table:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves an actor by actorID.
   * @param actorID - The actor's unique ID.
   * @returns The actor object or undefined.
   */
  public async getActor(actorID: string): Promise<Actor | undefined> {
    try {
      const res = await this.pool.query(
        `SELECT actorID AS "actorId", name, phone, email, dob, actorType AS "actorType" FROM actors WHERE actorID = $1`,
        [actorID]
      );
      if (res.rows.length > 0) {
        return res.rows[0] as Actor;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error(`Failed to get actor ${actorID}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves an actor by email.
   * @param email - The actor's email.
   * @returns The actor object or undefined.
   */
  public async getActorByEmail(email: string): Promise<Actor | undefined> {
    try {
      const res = await this.pool.query(
        `SELECT actorID AS "actorId", name, phone, email, dob, actorType AS "actorType" FROM actors WHERE email = $1`,
        [email]
      );
      if (res.rows.length > 0) {
        return res.rows[0] as Actor;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error(`Failed to get actor by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Check if a user with this email password combination exists
   * @param email the actor email you wish to validate the password for
   * @param password the password p[rovided by the user
   * @returns
   */
  public async validatePassword(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const res = await this.pool.query(
        `SELECT password FROM actors WHERE email = $1 AND actorType = $2`,
        [email, USER]
      );
      if (res.rows.length > 0) {
        return await bcrypt.compare(password, res.rows[0].password);
      } else {
        return false;
      }
    } catch (error) {
      console.error(
        `Failed to validate password for actor with email ${email}:`,
        error
      );
      throw error;
    }
  }


  /**
   * Check if a user with this email password combination exists
   * @param email the actor email you wish to validate the password for
   * @param password the password p[rovided by the user
   * @returns
   */
  public async validateSystemActor(
    actorId: string,
    systemToken: string
  ): Promise<boolean> {
    try {
      const res = await this.pool.query(
        `SELECT password FROM actors WHERE actorID = $1 AND actorType = $2`,
        [actorId, SYSTEM_ACTOR]
      );
      if (res.rows.length > 0) {
        return systemToken === res.rows[0].password;
      } else {
        return false;
      }
    } catch (error) {
      console.error(
        `Failed to validate system token for system actor with actor ID ${actorId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Adds or updates an actor in the database.
   * @param actor - The actor object.
   */
  public async addActor(actor: ActorRegistration): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO actors (actorID, name, phone, email, password, dob, actorType)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (actorID) DO UPDATE
                SET name = EXCLUDED.name,
                    phone = EXCLUDED.phone,
                    email = EXCLUDED.email,
                    dob = EXCLUDED.dob,
                    actorType = EXCLUDED.actorType`,
        [
          actor.actorId,
          actor.name,
          actor.phone,
          actor.email,
          actor.password,
          actor.dob,
          actor.actorType,
        ]
      );
    } catch (error) {
      console.error(`Failed to add actor ${actor.actorId}:`, error);
      throw error;
    }
  }
}
