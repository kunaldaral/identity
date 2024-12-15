
export { ActorModule } from "./actor";
export * from "./types";

// // src/index.ts

// import { Pool } from 'pg';
// import { ActorModule } from './actor';

// (async () => {
//     // Initialize PostgreSQL connection pool
//     const pool = new Pool({
//         user: process.env.DB_USER || 'your_db_user',
//         host: process.env.DB_HOST || 'localhost',
//         database: process.env.DB_NAME || 'your_db_name',
//         password: process.env.DB_PASSWORD || 'your_db_password',
//         port: parseInt(process.env.DB_PORT || '5432', 10),
//         max: 20,
//         idleTimeoutMillis: 30000,
//         connectionTimeoutMillis: 2000,
//     });

//     // Initialize the actor module
//     const actorModule = new ActorModule(pool);
//     await actorModule.initialize();

//     // Example usage

//     // Register a new user
//     const { accessToken, refreshToken } = await actorModule.userAuth.registerUser(
//         'Alice',
//         '555-1234',
//         'alice@example.com',
//         new Date('1992-08-15'),
//         'securepassword'
//     );
//     console.log('Access Token:', accessToken);
//     console.log('Refresh Token:', refreshToken);

//     // User login
//     const loginTokens = await actorModule.userAuth.loginUser('alice@example.com', 'securepassword');
//     console.log('Login Access Token:', loginTokens.accessToken);
//     console.log('Login Refresh Token:', loginTokens.refreshToken);

//     // Refresh access token
//     const newTokens = await actorModule.refreshAccessToken(loginTokens.refreshToken);
//     console.log('New Access Token:', newTokens.accessToken);
//     console.log('New Refresh Token:', newTokens.refreshToken);

//     // Revoke refresh token
//     const actor = await actorModule.getActorManager().getActorByEmail('alice@example.com');
//     if (actor) {
//         await actorModule.revokeRefreshToken(actor.actorID, loginTokens.refreshToken);
//         console.log('Refresh token revoked.');
//     }

//     // Authenticate with Google (requires actual Google setup)
//     // const googleIdToken = 'your_google_id_token';
//     // const googleTokens = await actorModule.thirdPartyAuth.authenticateWithGoogle(googleIdToken);
//     // console.log('Google Access Token:', googleTokens.accessToken);
//     // console.log('Google Refresh Token:', googleTokens.refreshToken);
// })();