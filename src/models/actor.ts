// src/models/actorModel.ts

import { ActorType } from "../types";

export interface Actor {
    actorId: string;
    name: string;
    phone: string;
    email: string;
    dob: Date;
    actorType: ActorType;
}

export interface ActorRegistration {
    actorId: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    dob: Date;
    actorType: ActorType;
}

export const actorTableSchema = `
CREATE TABLE IF NOT EXISTS actors (
    actorId TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    dob DATE,
    actorType VARCHAR(10)
);
`;