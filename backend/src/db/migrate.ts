import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Lade Umgebungsvariablen
dotenv.config({ path: './src/.env' });

/*
// Ensure all required environment variables are set
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'DB_PORT'];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`Environment variable ${varName} is not set.`);
        process.exit(1);
    }
});
*/

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT)
});

const db = drizzle(pool);

const main = async () => {
    try {
        await migrate(db, {
            migrationsFolder: './src/db/migrations',
        });
        console.log('Migration successful');
    } catch (error) {
        console.error('Migration failed', error);
        process.exit(1);
    }
};

main();