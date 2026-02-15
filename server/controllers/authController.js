import { readDB, writeDB } from '../utils/db.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'petanque-secret-key';

export const login = (req, res) => {
    const { email, password } = req.body;

    const users = readDB('users');
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "7d" });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
};

export const register = (req, res) => {
    const { email, password, prenom, nom, pseudo, departement } = req.body;

    const users = readDB('users');

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const id = `u${Date.now()}`;

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser = {
        id,
        email,
        password,
        prenom,
        nom,
        pseudo: pseudo || `${prenom}${Math.floor(Math.random() * 100)}`,
        departement,
        bio: "Nouveau joueur sur Pétanque Connect",
        avatarColor: randomColor,
        stats: { concoursJoues: 0, victoires: 0, ratio: 0 },
        amis: [],
        favoris: { concours: [], clubs: [], equipes: [] },
        derniereActivite: new Date().toISOString()
    };

    users.push(newUser);
    writeDB('users', users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: "7d" });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ token, user: userWithoutPassword });
};

export const getMe = (req, res) => {
    // Current user is already attached to req.user by middleware
    res.json(req.user);
};
