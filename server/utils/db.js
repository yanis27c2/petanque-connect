import pkg from 'pg';
const { Pool } = pkg;

<<<<<<< HEAD
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '..', 'db');

export function readDB(name) {
    const filePath = path.join(DB_DIR, `${name}.json`);
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        console.error(`Error reading ${name}.json:`, err.message);
        return [];
    }
}

export function writeDB(name, data) {
    const filePath = path.join(DB_DIR, `${name}.json`);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error(`Error writing ${name}.json:`, err.message);
    }
}

export function findUserById(id) {
    const users = readDB('users');
    return users.find(u => u.id === id) || null;
}
=======
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
>>>>>>> 39fa13d3145b9360e0338ba092787af7760e5060
