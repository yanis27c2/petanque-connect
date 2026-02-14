import { readDB, writeDB, findUserByEmail } from '../utils/db.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'petanque-secret-key'; // Should be env var

export const login = (req, res) => {
    const { email, password } = req.body;
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
};

export const register = (req, res) => {
    const { email, password, prenom, nom, pseudo, departement } = req.body;

    if (findUserByEmail(email)) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const users = readDB('users');

    // Random color generator
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser = {
        id: `u${Date.now()}`,
        email,
        password, // In real app, hash this!
        prenom,
        nom,
        pseudo: pseudo || `${prenom}${Math.floor(Math.random() * 100)}`,
        departement,
        bio: "Nouveau joueur sur Pétanque Connect",
        avatarColor: randomColor,
        stats: {
            concoursJoues: 0,
            victoires: 0,
            ratio: 0
        },
        amis: [],
        favoris: {
            concours: [],
            clubs: [],
            equipes: []
        },
        derniereActivite: new Date().toISOString()
    };

    users.push(newUser);
    writeDB('users', users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ token, user: userWithoutPassword });
};

export const getMe = (req, res) => {
    // Middleware should attach user to req
    // But for now, let's assume client sends ID or we verify token in middleware
    // Simple implementation:
    // If using middleware, req.user is set.
    res.json(req.user);
};
