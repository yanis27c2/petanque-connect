import { pool } from './utils/db.js';

export const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            prenom TEXT,
            nom TEXT,
            pseudo TEXT,
            departement TEXT,
            bio TEXT,
            avatar_color TEXT
        );
    `);

    console.log("✔ Table 'users' vérifiée/créée");
};
