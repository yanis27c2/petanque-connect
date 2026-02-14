import { readDB, writeDB } from '../utils/db.js';

export const getPosts = (req, res) => {
    const posts = readDB('posts');
    // Sort by recent?
    posts.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Check if current user liked them
    const userId = req.user.id;
    const enriched = posts.map(p => ({
        ...p,
        liked: p.likedBy ? p.likedBy.includes(userId) : false
    }));

    res.json(enriched);
};

export const createPost = (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;
    const users = readDB('users');
    const user = users.find(u => u.id === userId);

    if (!content) return res.status(400).json({ message: 'Contenu vide' });

    const posts = readDB('posts');
    const newPost = {
        id: `post_${Date.now()}`,
        authorId: userId,
        author: `${user.prenom} ${user.nom}`, // Denormalized for simplicity
        avatar: user.prenom.charAt(0),
        avatarColor: user.avatarColor || '#9ca3af',
        content,
        time: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: 0
    };

    posts.unshift(newPost);
    writeDB('posts', posts);

    res.json({ ...newPost, liked: false });
};

export const likePost = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const posts = readDB('posts');
    const post = posts.find(p => p.id === id);

    if (!post) return res.status(404).json({ message: 'Post introuvable' });

    if (!post.likedBy) post.likedBy = [];

    const index = post.likedBy.indexOf(userId);
    if (index === -1) {
        post.likedBy.push(userId);
        post.likes = (post.likes || 0) + 1;
    } else {
        post.likedBy.splice(index, 1);
        post.likes = Math.max(0, (post.likes || 0) - 1);
    }

    writeDB('posts', posts);

    res.json({
        id: post.id,
        likes: post.likes,
        liked: index === -1 // new status
    });
};
