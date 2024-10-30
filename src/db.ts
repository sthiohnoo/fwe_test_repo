import { drizzle } from 'drizzle-orm';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Lade Umgebungsvariablen
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,               // Verwendung der Umgebungsvariablen
    user: process.env.DB_USER,               // Verwendung der Umgebungsvariablen
    password: process.env.DB_PASSWORD,       // Verwendung der Umgebungsvariablen
    database: process.env.DB_DATABASE,       // Verwendung der Umgebungsvariablen
    port: Number(process.env.DB_PORT)        // Verwendung der Umgebungsvariablen
});

// Drizzle ORM-Instanz erstellen
const db = drizzle(pool);

export default db;
