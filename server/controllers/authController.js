import { pool } from '../utils/db.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'petanque-secret-key'; // à mettre en env plus tard

export const register = async (req, res) => {
    const { email, password, prenom, nom, pseudo, departement } = req.body;

    try {
        // Vérifier si l'email existe déjà
        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Générer une couleur aléatoire
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Créer l'utilisateur
        const result = await pool.query(
            `INSERT INTO users (email, password, prenom, nom, pseudo, departement, bio, avatar_color)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             RETURNING id, email, prenom, nom, pseudo, departement, bio, avatar_color`,
            [
                email,
                password, // à hasher plus tard
                prenom,
                nom,
                pseudo || `${prenom}${Math.floor(Math.random() * 100)}`,
                departement,
                "Nouveau joueur sur Pétanque Connect",
                randomColor
            ]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.status(201).json({ token, user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        delete user.password;

        res.json({ token, user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getMe = async (req, res) => {
    res.json(req.user);
};
