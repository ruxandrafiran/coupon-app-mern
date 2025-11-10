import User from "../models/User.js";
import jwt from "jsonwebtoken";

// generare JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
    let { username, password } = req.body;
    username = username.trim();
    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ username, password });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating user" });
    }
};

export const loginUser = async (req, res) => {
    let { username, password } = req.body;
    username = username.trim();
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error logging in" });
    }
};