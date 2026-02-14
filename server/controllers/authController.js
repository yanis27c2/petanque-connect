import pool from '../utils/db.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'petanque-secret-key';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        const user = result.rows[0];

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "7d" });

        delete user.password;

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const register = async (req, res) => {
    const { email, password, prenom, nom, pseudo, departement } = req.body;

    try {
        const exists = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (exists.rows.length > 0) {
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

        await pool.query(
            `INSERT INTO users (id, email, password, prenom, nom, pseudo, departement, bio, avatarColor, stats, amis, favoris, "derniereActivite")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [
                newUser.id,
                newUser.email,
                newUser.password,
                newUser.prenom,
                newUser.nom,
                newUser.pseudo,
                newUser.departement,
                newUser.bio,
                newUser.avatarColor,
                newUser.stats,
                newUser.amis,
                newUser.favoris,
                newUser.derniereActivite
            ]
        );

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: "7d" });

        delete newUser.password;

        res.status(201).json({ token, user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getMe = async (req, res) => {
    // Current user is already attached to req.user by middleware
    res.json(req.user);
};
