import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '../db');

const getPath = (collection) => path.join(DB_DIR, `${collection}.json`);

export const readDB = (collection) => {
    const p = getPath(collection);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
};

export const writeDB = (collection, data) => {
    const p = getPath(collection);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
};

export const findUserByEmail = (email) => {
    const users = readDB('users');
    return users.find(u => u.email === email);
};

export const findUserById = (id) => {
    const users = readDB('users');
    return users.find(u => u.id === id);
};
